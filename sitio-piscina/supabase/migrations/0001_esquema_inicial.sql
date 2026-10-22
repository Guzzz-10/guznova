-- ═══════════════════════════════════════════════════════════════════
--  Esquema inicial: socios, pagos, accesos, reservas, contenido del sitio
--  y panel de administración. Ejecutalo en Supabase → SQL Editor.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── ADMINISTRADOR ─────────────────────────
-- El email autorizado se sincroniza solo desde la variable ADMIN_EMAIL
-- cada vez que el dueño inicia sesión con Google (ver /auth/callback).
create table if not exists public.admin_autorizado (
  email text primary key check (email = lower(email)),
  creado_el timestamptz not null default now()
);
alter table public.admin_autorizado enable row level security;
-- (sin políticas: nadie puede leerla ni modificarla desde la API)

-- Es admin solo si el email del JWT es el autorizado Y la sesión se inició con OAuth (Google).
create or replace function public.es_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select
    exists (select 1 from public.admin_autorizado a where a.email = lower(coalesce(auth.jwt() ->> 'email', '')))
    and (
      coalesce(auth.jwt() -> 'amr', '[]'::jsonb) @> '[{"method": "oauth"}]'::jsonb
      or coalesce(auth.jwt() -> 'amr', '[]'::jsonb) @> '["oauth"]'::jsonb
    );
$$;

-- ───────────────────────── SOCIOS ─────────────────────────
create sequence if not exists public.numero_socio_seq start 1001;

create table if not exists public.socios (
  id uuid primary key references auth.users (id) on delete cascade,
  numero_socio integer unique,
  nombre_completo text not null,
  cedula text not null unique,
  fecha_nacimiento date not null,
  telefono text not null,
  email text not null,
  foto_path text,
  plan_id text not null,
  suspendido boolean not null default false,
  vence_el timestamptz,
  qr_token text unique,
  mp_preapproval_id text,
  renovacion_automatica boolean not null default false,
  acepto_terminos_el timestamptz,
  notas text,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);
create index if not exists socios_vence_idx on public.socios (vence_el);
create index if not exists socios_preapproval_idx on public.socios (mp_preapproval_id);

-- Estado calculado a partir de la fecha de vencimiento (no hace falta un cron).
-- También sirve como "columna calculada" en la API: select=*,estado_socio
create or replace function public.estado_socio(s public.socios)
returns text
language sql stable
as $$
  select case
    when s.suspendido then 'suspendido'
    when s.vence_el is null then 'pendiente'
    when s.vence_el >= now() then 'activo'
    else 'vencido'
  end;
$$;

create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$
begin
  new.actualizado_el := now();
  return new;
end $$;

drop trigger if exists socios_actualizado on public.socios;
create trigger socios_actualizado before update on public.socios
  for each row execute function public.tocar_actualizado();

-- ───────────────────────── PAGOS ─────────────────────────
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid references public.socios (id) on delete set null,
  socio_nombre text,
  plan_id text not null,
  monto numeric(10, 2) not null,
  moneda text not null default 'UYU',
  metodo text not null check (metodo in ('mercadopago', 'efectivo', 'transferencia')),
  estado text not null check (estado in ('aprobado', 'pendiente', 'rechazado', 'reembolsado')),
  mp_payment_id text unique,
  mp_preapproval_id text,
  periodo_desde timestamptz,
  periodo_hasta timestamptz,
  detalle text,
  registrado_por text,
  creado_el timestamptz not null default now()
);
create index if not exists pagos_socio_idx on public.pagos (socio_id, creado_el desc);
create index if not exists pagos_fecha_idx on public.pagos (creado_el desc);

-- ───────────────────────── ACCESOS (control de ingreso) ─────────────────────────
create table if not exists public.accesos (
  id bigint generated always as identity primary key,
  socio_id uuid references public.socios (id) on delete set null,
  nombre text,
  codigo text,
  resultado text not null check (resultado in ('permitido', 'vencido', 'suspendido', 'pendiente', 'desconocido')),
  creado_el timestamptz not null default now()
);
create index if not exists accesos_fecha_idx on public.accesos (creado_el desc);

-- ───────────────────────── CONTENIDO DEL SITIO ─────────────────────────
-- Bloques de texto: negocio, hero, historia, contacto, whatsapp
create table if not exists public.contenido (
  clave text primary key,
  valor jsonb not null default '{}'::jsonb,
  actualizado_el timestamptz not null default now()
);

create table if not exists public.planes (
  id text primary key,
  nombre text not null,
  precio integer not null check (precio > 0),
  bajada text not null default '',
  etiqueta text,
  destacado boolean not null default false,
  incluye text[] not null default '{}',
  color text not null default 'agua',
  activo boolean not null default true,
  orden integer not null default 0,
  creado_el timestamptz not null default now()
);

create table if not exists public.piscinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default '',
  descripcion text not null default '',
  imagen_url text,
  medidas text not null default '',
  profundidad text not null default '',
  temperatura text not null default '',
  ideal_para text[] not null default '{}',
  color text not null default 'agua',
  orden integer not null default 0
);

create table if not exists public.galeria (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text,
  alt text not null default '',
  ancho integer,
  alto integer,
  orden integer not null default 0,
  creado_el timestamptz not null default now()
);

create table if not exists public.hitos (
  id uuid primary key default gen_random_uuid(),
  anio integer not null,
  titulo text not null,
  texto text not null default '',
  imagen_url text,
  imagen_alt text not null default '',
  antigua boolean not null default false,
  orden integer not null default 0
);

create table if not exists public.clases (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('natacion', 'aquafitness', 'bebes', 'nado-libre')),
  descripcion text not null default '',
  profesor text not null default '',
  nivel text not null default '',
  edad text not null default '',
  grupos text[] not null default '{}',
  duracion text not null default '',
  precio integer not null default 0,
  frecuencia text not null default '',
  incluida_en text not null default '',
  piscina text not null default '',
  color text not null default 'agua',
  icono text not null default 'nadador',
  foto_url text,
  activa boolean not null default true,
  orden integer not null default 0
);

-- dia: 1 = lunes … 7 = domingo
create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid not null references public.clases (id) on delete cascade,
  dia smallint not null check (dia between 1 and 7),
  hora time not null,
  cupo integer not null check (cupo >= 0),
  activo boolean not null default true,
  unique (clase_id, dia, hora)
);

-- ───────────────────────── RESERVAS DE CLASES ─────────────────────────
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  horario_id uuid not null references public.horarios (id) on delete cascade,
  socio_id uuid not null references public.socios (id) on delete cascade,
  fecha date not null,
  estado text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  creado_el timestamptz not null default now(),
  cancelada_el timestamptz,
  cancelada_por text
);
create unique index if not exists reservas_unica on public.reservas (horario_id, socio_id, fecha) where estado = 'confirmada';
create index if not exists reservas_fecha_idx on public.reservas (fecha, horario_id);

-- ───────────────────────── REGISTRO DE ACTIVIDAD Y SECRETOS ─────────────────────────
create table if not exists public.actividad (
  id bigint generated always as identity primary key,
  email text,
  accion text not null,
  detalle text,
  creado_el timestamptz not null default now()
);
create index if not exists actividad_fecha_idx on public.actividad (creado_el desc);

-- Credenciales cargadas desde el panel (ej. token de Mercado Pago). Solo la service role las lee.
create table if not exists public.secretos (
  clave text primary key,
  valor text not null,
  actualizado_el timestamptz not null default now()
);

-- ═══════════════════════════ SEGURIDAD (RLS) ═══════════════════════════
alter table public.socios enable row level security;
alter table public.pagos enable row level security;
alter table public.accesos enable row level security;
alter table public.contenido enable row level security;
alter table public.planes enable row level security;
alter table public.piscinas enable row level security;
alter table public.galeria enable row level security;
alter table public.hitos enable row level security;
alter table public.clases enable row level security;
alter table public.horarios enable row level security;
alter table public.reservas enable row level security;
alter table public.actividad enable row level security;
alter table public.secretos enable row level security;

-- Socios: cada uno ve SOLO su ficha; el admin ve y gestiona todas. Nadie más puede escribir.
drop policy if exists "socio ve su ficha" on public.socios;
create policy "socio ve su ficha" on public.socios for select to authenticated
  using (id = auth.uid() or public.es_admin());
drop policy if exists "admin gestiona socios" on public.socios;
create policy "admin gestiona socios" on public.socios for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Pagos
drop policy if exists "socio ve sus pagos" on public.pagos;
create policy "socio ve sus pagos" on public.pagos for select to authenticated
  using (socio_id = auth.uid() or public.es_admin());
drop policy if exists "admin gestiona pagos" on public.pagos;
create policy "admin gestiona pagos" on public.pagos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Accesos: solo admin
drop policy if exists "admin gestiona accesos" on public.accesos;
create policy "admin gestiona accesos" on public.accesos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Reservas: el socio ve las suyas (se crean y cancelan con funciones), el admin todas
drop policy if exists "socio ve sus reservas" on public.reservas;
create policy "socio ve sus reservas" on public.reservas for select to authenticated
  using (socio_id = auth.uid() or public.es_admin());
drop policy if exists "admin gestiona reservas" on public.reservas;
create policy "admin gestiona reservas" on public.reservas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Actividad: solo admin
drop policy if exists "admin ve actividad" on public.actividad;
create policy "admin ve actividad" on public.actividad for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Contenido público: lectura para todos, escritura solo admin
do $$
declare t text;
begin
  foreach t in array array['contenido', 'planes', 'piscinas', 'galeria', 'hitos', 'clases', 'horarios'] loop
    execute format('drop policy if exists "lectura publica" on public.%I', t);
    execute format('create policy "lectura publica" on public.%I for select to anon, authenticated using (true)', t);
    execute format('drop policy if exists "admin edita" on public.%I', t);
    execute format('create policy "admin edita" on public.%I for all to authenticated using (public.es_admin()) with check (public.es_admin())', t);
  end loop;
end $$;

-- ═══════════════════════════ ALMACENAMIENTO ═══════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('fotos-socios', 'fotos-socios', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('sitio', 'sitio', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'])
on conflict (id) do nothing;

-- Fotos de socios (privadas): carpeta = id del socio
drop policy if exists "socio ve su foto" on storage.objects;
create policy "socio ve su foto" on storage.objects for select to authenticated
  using (bucket_id = 'fotos-socios' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin()));
drop policy if exists "admin gestiona fotos de socios" on storage.objects;
create policy "admin gestiona fotos de socios" on storage.objects for all to authenticated
  using (bucket_id = 'fotos-socios' and public.es_admin())
  with check (bucket_id = 'fotos-socios' and public.es_admin());

-- Archivos del sitio (públicos para ver, solo el admin sube/borra)
drop policy if exists "admin gestiona archivos del sitio" on storage.objects;
create policy "admin gestiona archivos del sitio" on storage.objects for all to authenticated
  using (bucket_id = 'sitio' and public.es_admin())
  with check (bucket_id = 'sitio' and public.es_admin());

-- ═══════════════════════════ FUNCIONES ═══════════════════════════

-- Próxima fecha en que ocurre un horario (hora de Montevideo).
create or replace function public.proxima_fecha(p_dia smallint, p_hora time)
returns date
language sql stable
as $$
  with a as (select (now() at time zone 'America/Montevideo') as t),
       d as (select t, ((p_dia - extract(isodow from t)::int + 7) % 7) as delta from a)
  select (t::date + case when delta = 0 and p_hora <= t::time then 7 else delta end)::date from d;
$$;

-- Registra un pago. Si está aprobado, extiende el vencimiento del socio y genera el carnet
-- (número de socio + QR) si todavía no lo tenía. Es idempotente por mp_payment_id.
create or replace function public.registrar_pago(
  p_socio uuid,
  p_plan text,
  p_monto numeric,
  p_metodo text,
  p_estado text,
  p_mp_payment_id text default null,
  p_mp_preapproval_id text default null,
  p_detalle text default null,
  p_meses integer default 1
)
returns public.pagos
language plpgsql security definer
set search_path = public
as $$
declare
  v_socio public.socios;
  v_pago public.pagos;
  v_desde timestamptz;
  v_hasta timestamptz;
  v_quien text := coalesce(auth.jwt() ->> 'email', 'sistema');
begin
  if not (coalesce(auth.role(), '') = 'service_role' or public.es_admin()) then
    raise exception 'NO_PERMITIDO';
  end if;

  select * into v_socio from public.socios where id = p_socio for update;
  if not found then raise exception 'SOCIO_INEXISTENTE'; end if;

  if p_mp_payment_id is not null then
    select * into v_pago from public.pagos where mp_payment_id = p_mp_payment_id for update;
    if found then
      if v_pago.estado = 'aprobado' then
        if p_estado = 'reembolsado' then
          update public.pagos set estado = 'reembolsado' where id = v_pago.id returning * into v_pago;
        end if;
        return v_pago;
      elsif p_estado <> 'aprobado' then
        update public.pagos set estado = p_estado where id = v_pago.id returning * into v_pago;
        return v_pago;
      end if;
    end if;
  end if;

  if p_estado = 'aprobado' then
    v_desde := greatest(now(), coalesce(v_socio.vence_el, now()));
    v_hasta := v_desde + make_interval(months => greatest(p_meses, 1));
  end if;

  if v_pago.id is not null then
    update public.pagos
       set estado = p_estado, periodo_desde = v_desde, periodo_hasta = v_hasta, monto = p_monto
     where id = v_pago.id
     returning * into v_pago;
  else
    insert into public.pagos (socio_id, socio_nombre, plan_id, monto, metodo, estado, mp_payment_id, mp_preapproval_id, periodo_desde, periodo_hasta, detalle, registrado_por)
    values (p_socio, v_socio.nombre_completo, p_plan, p_monto, p_metodo, p_estado, p_mp_payment_id, p_mp_preapproval_id, v_desde, v_hasta, p_detalle, v_quien)
    returning * into v_pago;
  end if;

  if p_estado = 'aprobado' then
    update public.socios
       set vence_el = v_hasta,
           plan_id = p_plan,
           numero_socio = coalesce(numero_socio, nextval('public.numero_socio_seq')),
           qr_token = coalesce(qr_token, encode(extensions.gen_random_bytes(16), 'hex')),
           mp_preapproval_id = coalesce(p_mp_preapproval_id, mp_preapproval_id),
           renovacion_automatica = case when p_mp_preapproval_id is not null then true else renovacion_automatica end
     where id = p_socio;
  end if;

  return v_pago;
end $$;

-- Valida el QR (o número de socio / cédula) en la entrada y registra el acceso.
create or replace function public.validar_ingreso(p_codigo text)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v public.socios;
  v_cod text := trim(coalesce(p_codigo, ''));
  v_dig text := regexp_replace(trim(coalesce(p_codigo, '')), '\D', '', 'g');
  v_res text;
begin
  if not public.es_admin() then raise exception 'NO_PERMITIDO'; end if;

  select * into v from public.socios where qr_token = v_cod;
  if not found and length(v_cod) <= 12 and v_dig <> '' then
    select * into v from public.socios
     where numero_socio::text = ltrim(v_dig, '0') or cedula = v_dig
     limit 1;
  end if;

  if v.id is null then
    insert into public.accesos (codigo, resultado) values (left(v_cod, 64), 'desconocido');
    return jsonb_build_object('resultado', 'desconocido');
  end if;

  v_res := case public.estado_socio(v) when 'activo' then 'permitido' else public.estado_socio(v) end;
  insert into public.accesos (socio_id, nombre, codigo, resultado) values (v.id, v.nombre_completo, left(v_cod, 64), v_res);

  return jsonb_build_object(
    'resultado', v_res,
    'socio', jsonb_build_object(
      'id', v.id, 'nombre', v.nombre_completo, 'cedula', v.cedula, 'numero', v.numero_socio,
      'plan', v.plan_id, 'vence_el', v.vence_el, 'foto_path', v.foto_path
    ),
    'accesos_hoy', (
      select count(*) from public.accesos a
       where a.socio_id = v.id and a.resultado = 'permitido'
         and a.creado_el >= (date_trunc('day', now() at time zone 'America/Montevideo') at time zone 'America/Montevideo')
    )
  );
end $$;

-- Nuevo QR (si el socio lo perdió o lo compartió). El viejo deja de funcionar.
create or replace function public.regenerar_qr(p_socio uuid)
returns text
language plpgsql security definer
set search_path = public
as $$
declare v_token text := encode(extensions.gen_random_bytes(16), 'hex');
begin
  if not (public.es_admin() or p_socio = auth.uid()) then raise exception 'NO_PERMITIDO'; end if;
  update public.socios set qr_token = v_token where id = p_socio and numero_socio is not null;
  if not found then raise exception 'SIN_CARNET'; end if;
  return v_token;
end $$;

-- Ocupación de la próxima fecha de cada horario (público: solo números, sin datos personales).
create or replace function public.disponibilidad()
returns table (horario_id uuid, fecha date, ocupados integer)
language sql stable security definer
set search_path = public
as $$
  select h.id, f.fecha,
         (select count(*)::int from public.reservas r
           where r.horario_id = h.id and r.fecha = f.fecha and r.estado = 'confirmada')
    from public.horarios h
    join public.clases c on c.id = h.clase_id and c.activa
   cross join lateral (select public.proxima_fecha(h.dia, h.hora) as fecha) f
   where h.activo;
$$;

-- Reserva de un lugar para la próxima fecha del horario. Controla el cupo sin carreras.
create or replace function public.reservar_clase(p_horario uuid)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_socio public.socios;
  v_h public.horarios;
  v_fecha date;
  v_ocupados integer;
  v_id uuid;
begin
  select * into v_socio from public.socios where id = auth.uid();
  if not found then raise exception 'NO_SOCIO'; end if;
  if public.estado_socio(v_socio) <> 'activo' then raise exception 'SOCIO_NO_ACTIVO'; end if;

  select h.* into v_h
    from public.horarios h join public.clases c on c.id = h.clase_id
   where h.id = p_horario and h.activo and c.activa
   for update of h;
  if not found then raise exception 'HORARIO_INEXISTENTE'; end if;

  v_fecha := public.proxima_fecha(v_h.dia, v_h.hora);

  if exists (select 1 from public.reservas where horario_id = p_horario and socio_id = v_socio.id and fecha = v_fecha and estado = 'confirmada') then
    raise exception 'YA_RESERVADO';
  end if;

  select count(*) into v_ocupados from public.reservas where horario_id = p_horario and fecha = v_fecha and estado = 'confirmada';
  if v_ocupados >= v_h.cupo then raise exception 'SIN_CUPO'; end if;

  insert into public.reservas (horario_id, socio_id, fecha) values (p_horario, v_socio.id, v_fecha) returning id into v_id;
  return jsonb_build_object('id', v_id, 'fecha', v_fecha, 'ocupados', v_ocupados + 1, 'cupo', v_h.cupo);
end $$;

-- Cancelar: el socio (reservas futuras) o el admin.
create or replace function public.cancelar_reserva(p_reserva uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v public.reservas;
begin
  select * into v from public.reservas where id = p_reserva for update;
  if not found then raise exception 'NO_EXISTE'; end if;
  if not (public.es_admin() or (v.socio_id = auth.uid() and v.fecha >= (now() at time zone 'America/Montevideo')::date)) then
    raise exception 'NO_PERMITIDO';
  end if;
  update public.reservas
     set estado = 'cancelada', cancelada_el = now(), cancelada_por = coalesce(auth.jwt() ->> 'email', '')
   where id = p_reserva;
end $$;

-- Mover una reserva a otro horario/fecha (solo admin), controlando el cupo del destino.
create or replace function public.mover_reserva(p_reserva uuid, p_horario uuid, p_fecha date)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v public.reservas;
  v_h public.horarios;
  v_ocupados integer;
begin
  if not public.es_admin() then raise exception 'NO_PERMITIDO'; end if;
  select * into v from public.reservas where id = p_reserva and estado = 'confirmada' for update;
  if not found then raise exception 'NO_EXISTE'; end if;
  select * into v_h from public.horarios where id = p_horario for update;
  if not found then raise exception 'HORARIO_INEXISTENTE'; end if;
  if extract(isodow from p_fecha)::int <> v_h.dia then raise exception 'FECHA_NO_COINCIDE'; end if;
  select count(*) into v_ocupados from public.reservas
   where horario_id = p_horario and fecha = p_fecha and estado = 'confirmada' and id <> p_reserva;
  if v_ocupados >= v_h.cupo then raise exception 'SIN_CUPO'; end if;
  update public.reservas set horario_id = p_horario, fecha = p_fecha where id = p_reserva;
end $$;

-- Números del dashboard en una sola llamada.
create or replace function public.estadisticas_admin()
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_hoy date := (now() at time zone 'America/Montevideo')::date;
  v_inicio_hoy timestamptz := (date_trunc('day', now() at time zone 'America/Montevideo') at time zone 'America/Montevideo');
  v_mes_local timestamp := date_trunc('month', now() at time zone 'America/Montevideo');
  v_inicio_mes timestamptz := v_mes_local at time zone 'America/Montevideo';
begin
  if not public.es_admin() then raise exception 'NO_PERMITIDO'; end if;
  return jsonb_build_object(
    'activos', (select count(*) from public.socios s where public.estado_socio(s) = 'activo'),
    'vencidos', (select count(*) from public.socios s where public.estado_socio(s) = 'vencido'),
    'pendientes', (select count(*) from public.socios s where public.estado_socio(s) = 'pendiente'),
    'suspendidos', (select count(*) from public.socios s where s.suspendido),
    'ingresos_mes', (select coalesce(sum(monto), 0) from public.pagos where estado = 'aprobado' and creado_el >= v_inicio_mes),
    'reservas_hoy', (select count(*) from public.reservas where fecha = v_hoy and estado = 'confirmada'),
    'accesos_hoy', (select count(*) from public.accesos where creado_el >= v_inicio_hoy and resultado = 'permitido'),
    'serie_ingresos', (
      select coalesce(jsonb_agg(jsonb_build_object('mes', to_char(m, 'YYYY-MM'), 'total', coalesce(t.total, 0)) order by m), '[]'::jsonb)
        from generate_series(v_mes_local - interval '11 months', v_mes_local, interval '1 month') m
        left join (
          select date_trunc('month', creado_el at time zone 'America/Montevideo') as mes, sum(monto) as total
            from public.pagos where estado = 'aprobado' group by 1
        ) t on t.mes = m
    ),
    'serie_altas', (
      select coalesce(jsonb_agg(jsonb_build_object('mes', to_char(m, 'YYYY-MM'), 'total', coalesce(t.total, 0)) order by m), '[]'::jsonb)
        from generate_series(v_mes_local - interval '11 months', v_mes_local, interval '1 month') m
        left join (
          select date_trunc('month', creado_el at time zone 'America/Montevideo') as mes, count(*) as total
            from public.socios where numero_socio is not null group by 1
        ) t on t.mes = m
    ),
    'top_clases', (
      select coalesce(jsonb_agg(x order by x.total desc), '[]'::jsonb) from (
        select c.nombre, count(*) as total
          from public.reservas r join public.horarios h on h.id = r.horario_id join public.clases c on c.id = h.clase_id
         where r.estado = 'confirmada' and r.fecha >= v_hoy - 30
         group by c.nombre order by count(*) desc limit 6
      ) x
    ),
    'vencen_pronto', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'id', s.id, 'nombre', s.nombre_completo, 'numero', s.numero_socio, 'plan', s.plan_id,
               'vence_el', s.vence_el, 'telefono', s.telefono, 'renovacion_automatica', s.renovacion_automatica
             ) order by s.vence_el), '[]'::jsonb)
        from public.socios s
       where not s.suspendido and s.vence_el between now() and now() + interval '7 days'
    )
  );
end $$;

-- Permisos de ejecución
revoke execute on function public.registrar_pago(uuid, text, numeric, text, text, text, text, text, integer) from public, anon;
revoke execute on function public.validar_ingreso(text) from public, anon;
revoke execute on function public.regenerar_qr(uuid) from public, anon;
revoke execute on function public.reservar_clase(uuid) from public, anon;
revoke execute on function public.cancelar_reserva(uuid) from public, anon;
revoke execute on function public.mover_reserva(uuid, uuid, date) from public, anon;
revoke execute on function public.estadisticas_admin() from public, anon;
grant execute on function public.registrar_pago(uuid, text, numeric, text, text, text, text, text, integer) to authenticated, service_role;
grant execute on function public.validar_ingreso(text) to authenticated;
grant execute on function public.regenerar_qr(uuid) to authenticated;
grant execute on function public.reservar_clase(uuid) to authenticated;
grant execute on function public.cancelar_reserva(uuid) to authenticated;
grant execute on function public.mover_reserva(uuid, uuid, date) to authenticated;
grant execute on function public.estadisticas_admin() to authenticated;
grant execute on function public.disponibilidad() to anon, authenticated;
grant execute on function public.es_admin() to anon, authenticated;
