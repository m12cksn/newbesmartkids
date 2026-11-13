-- Uji fungsi paket sekolah di Postgres lokal (dijalankan setelah semua migrasi).
\set ON_ERROR_STOP 1
do $$
declare tok_admin text; tok_guru text; tok_guru2 text; tok_siswa text; r jsonb; g uuid; guru uuid; guru2 uuid; siswa uuid; s1 uuid; rows jsonb;
begin
  insert into bsk.accounts (username, pin_hash, role) values ('admin', extensions.crypt('111111', extensions.gen_salt('bf', 4)), 'admin');
  tok_admin := public.bsk_login('admin', '111111') ->> 'token';

  -- Guru dibuat seperti akun biasa lalu diubah perannya.
  guru := ((public.bsk_admin_create(tok_admin, 'bu.sari', 'Bu Sari', '', '', 'kelas', 4)) -> 'account' ->> 'id')::uuid;
  guru2 := ((public.bsk_admin_create(tok_admin, 'pak.budi', 'Pak Budi', '', '', 'kelas', 5)) -> 'account' ->> 'id')::uuid;
  siswa := ((public.bsk_admin_create(tok_admin, 'lama01', 'Lama', '', '', 'kelas', 4)) -> 'account' ->> 'id')::uuid;
  assert public.bsk_admin_set_role(tok_admin, guru, 'teacher') ->> 'role' = 'teacher';
  assert public.bsk_admin_set_role(tok_admin, guru2, 'teacher') ->> 'role' = 'teacher';
  assert public.bsk_admin_set_role(tok_admin, guru, 'admin') ->> 'error' = 'bad_role';

  -- Kelas sekolah.
  assert public.bsk_admin_group_save(tok_admin, null, '  ', guru, 4) ->> 'error' = 'bad_name';
  assert public.bsk_admin_group_save(tok_admin, null, '4A', siswa, 4) ->> 'error' = 'bad_teacher';
  g := (public.bsk_admin_group_save(tok_admin, null, '4A SD Harapan', guru, 4) ->> 'id')::uuid;
  perform public.bsk_admin_group_save(tok_admin, null, '5B', guru2, 5);

  -- Buat banyak akun sekaligus.
  assert public.bsk_admin_bulk_create(tok_admin, g, 'X', array['A'], 'kelas', 4) ->> 'error' = 'bad_prefix';
  r := public.bsk_admin_bulk_create(tok_admin, g, 'sdh4a', array['Ani', '', 'Budi', 'Caca'], 'kelas', 4);
  assert jsonb_array_length(r -> 'created') = 3, 'tiga akun';
  assert r -> 'created' -> 0 ->> 'username' = 'sdh4a01' and r -> 'created' -> 2 ->> 'username' = 'sdh4a03';
  assert (r -> 'created' -> 0 ->> 'pin') ~ '^\d{6}$';
  assert jsonb_array_length(r -> 'group' -> 'members') = 3;
  -- Awalan yang sama melanjutkan nomor urut.
  r := public.bsk_admin_bulk_create(tok_admin, g, 'sdh4a', array['Dodi'], 'kelas', 4);
  assert r -> 'created' -> 0 ->> 'username' = 'sdh4a04';
  -- Akun baru langsung mendapat paket.
  assert (select count(*) from bsk.entitlements e join bsk.accounts a on a.id = e.account_id where a.username like 'sdh4a%' and e.class_id = 4) = 4;

  -- Tambah akun lama berdasarkan username; guru dan username asing ditolak.
  r := public.bsk_admin_group_add(tok_admin, g, array['LAMA01', 'tidakada', 'bu.sari', 'lama01']);
  assert r -> 'missing' @> '["tidakada", "bu.sari"]' and jsonb_array_length(r -> 'missing') = 2, r::text;
  assert jsonb_array_length(r -> 'group' -> 'members') = 5;

  -- Hasil belajar siswa.
  tok_siswa := public.bsk_login('sdh4a01', (select null::text)) ->> 'token'; -- PIN tidak diketahui: login gagal
  assert tok_siswa is null;
  update bsk.accounts set pin_hash = extensions.crypt('123456', extensions.gen_salt('bf', 4)) where username = 'sdh4a01';
  tok_siswa := public.bsk_login('sdh4a01', '123456') ->> 'token';
  s1 := (select id from bsk.accounts where username = 'sdh4a01');
  perform public.bsk_save_result(tok_siswa, '/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar', 'Bangun Datar', 'latihan', 'Subbab 1', 3, 4);
  perform public.bsk_save_result(tok_siswa, '/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar', 'Bangun Datar', 'evaluasi', '', 18, 24);
  perform public.bsk_save_result(tok_siswa, '/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar?ulang=1', 'Bangun Datar', 'evaluasi', '', 12, 24);
  perform public.bsk_save_result(tok_siswa, '/mastering-perkalian-pembagian/level-1', 'Harian', 'harian', '', 7, 7);

  -- Siswa tidak bisa membuka rekap guru.
  begin perform public.bsk_teacher_overview(tok_siswa); assert false, 'siswa lolos'; exception when insufficient_privilege then null; end;

  -- Guru melihat rekap kelasnya saja.
  update bsk.accounts set pin_hash = extensions.crypt('222222', extensions.gen_salt('bf', 4)) where id in (guru, guru2);
  tok_guru := public.bsk_login('bu.sari', '222222') ->> 'token';
  tok_guru2 := public.bsk_login('pak.budi', '222222') ->> 'token';
  r := public.bsk_teacher_overview(tok_guru);
  assert jsonb_array_length(r -> 'groups') = 1 and r -> 'groups' -> 0 ->> 'name' = '4A SD Harapan';
  select m into rows from jsonb_array_elements(r -> 'groups' -> 0 -> 'members') m where m ->> 'username' = 'sdh4a01';
  assert jsonb_array_length(rows -> 'chapters') = 1, 'satu bab (harian tidak dihitung, ?ulang digabung)';
  assert (rows -> 'chapters' -> 0 ->> 'best')::int = 75 and (rows -> 'chapters' -> 0 ->> 'last')::int = 50, rows::text;
  assert (rows -> 'chapters' -> 0 ->> 'evals')::int = 2 and (rows -> 'chapters' -> 0 ->> 'practice')::int = 1;
  assert rows -> 'chapters' -> 0 ->> 'path' = '/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar';
  assert (rows ->> 'week')::int = 4;
  assert jsonb_array_length(public.bsk_teacher_overview(tok_guru2) -> 'groups' -> 0 -> 'members') = 0;
  assert jsonb_array_length(public.bsk_teacher_overview(tok_admin) -> 'groups') = 2;

  -- Laporan siswa: hanya untuk guru kelasnya.
  assert jsonb_array_length(public.bsk_teacher_report(tok_guru, s1) -> 'results') = 4;
  assert public.bsk_teacher_report(tok_guru2, s1) is null;
  -- Guru bukan admin.
  begin perform public.bsk_admin_groups(tok_guru); assert false, 'guru lolos admin'; exception when insufficient_privilege then null; end;

  -- Keluarkan siswa dari kelas, ganti peran guru menjadi siswa melepas kelasnya.
  assert jsonb_array_length(public.bsk_admin_group_remove(tok_admin, g, s1) -> 'members') = 4;
  assert public.bsk_teacher_report(tok_guru, s1) is null;
  perform public.bsk_admin_set_role(tok_admin, guru2, 'student');
  assert (select teacher_id from bsk.groups where name = '5B') is null;
  perform public.bsk_admin_group_delete(tok_admin, g);
  assert not exists (select 1 from bsk.group_members where group_id = g);
  assert jsonb_array_length(public.bsk_admin_groups(tok_admin)) = 1;
  raise notice 'SEMUA UJI SQL LULUS';
end $$;
