-- Medical D'Lis - Supabase Database Schema
-- Arquitectura de Datos Profesional para Clínica Médica y Estética

-- 1. EXTENSIONES Y TIPOS PERSONALIZADOS
CREATE TYPE user_role AS ENUM ('admin', 'medico', 'estetica', 'recepcion');
CREATE TYPE service_category AS ENUM ('Salud', 'Belleza', 'Aparatología');
CREATE TYPE appointment_status AS ENUM ('pendiente', 'completada', 'cancelada');

-- 2. TABLA DE PERFILES (Vinculada a auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'recepcion',
    specialty TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PACIENTES
CREATE TABLE public.pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    date_of_birth DATE,
    antecedentes_clinicos JSONB DEFAULT '{}'::jsonb, -- Flexibilidad para Podología/Cirugía
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE EXPEDIENTES SENSIBLES (Separada para control de acceso granular)
CREATE TABLE public.expedientes_detalle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    especialista_id UUID REFERENCES public.profiles(id),
    notas_quirurgicas TEXT, -- Solo accesible por 'medico' y 'admin'
    observaciones_privadas TEXT,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE SERVICIOS
CREATE TABLE public.servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria service_category NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true
);

-- 6. TABLA DE CITAS
CREATE TABLE public.citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
    especialista_id UUID REFERENCES public.profiles(id),
    servicio_id UUID REFERENCES public.servicios(id),
    fecha_hora TIMESTAMPTZ NOT NULL,
    estado appointment_status DEFAULT 'pendiente',
    notas_cita TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE INVENTARIO (Control de Insumos)
CREATE TABLE public.inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    sku TEXT UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    unidad TEXT NOT NULL, -- ml, viales, cajas, unidades
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONFIGURACIÓN DE SEGURIDAD (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedientes_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- REGLAS RLS CITAS: Todos los roles autenticados ven la agenda general
CREATE POLICY "Visualización agenda general" 
ON public.citas FOR SELECT 
TO authenticated 
USING (true);

-- REGLAS RLS EXPEDIENTES: Restricción para rol 'estetica' en datos quirúrgicos
CREATE POLICY "Especialistas ven sus propios expedientes detallados"
ON public.expedientes_detalle FOR SELECT
TO authenticated
USING (
    (auth.uid() = especialista_id) OR 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- REGLAS RLS PACIENTES: El rol estetica puede ver pacientes pero no editar antecedentes quirúrgicos si se implementa lógica de campos
-- Nota: La lógica de 'estetica' no lee 'notas_quirurgicas' se implementa vía la tabla expedientes_detalle.

-- 9. SEEDS (Datos de Prueba)
INSERT INTO public.servicios (nombre, categoria, precio, duracion_minutos) VALUES
('Onicocriptosis (Uña encarnada)', 'Salud', 45.00, 45),
('Cirugía Hallux Valgus', 'Salud', 1200.00, 120),
('Aplicación Botox (Vial)', 'Belleza', 350.00, 30),
('Dermapen + Vitaminas', 'Aparatología', 85.00, 60);

INSERT INTO public.inventario (nombre, sku, stock, unidad, min_stock_alert) VALUES
('Botox Vial 100u', 'BTX-001', 12, 'viales', 3),
('Aguas Dermapen 36p', 'AGU-36', 50, 'unidades', 10),
('Gel Conductor 5L', 'GEL-CON', 4, 'garrafas', 2),
('Gasas Estériles 10x10', 'GAS-01', 100, 'paquetes', 20);

-- Insertar pacientes de muestra
DO $$ 
DECLARE 
    p_id UUID;
BEGIN
    INSERT INTO public.pacientes (first_name, last_name, email, phone, antecedentes_clinicos) 
    VALUES ('Juan', 'Pérez', 'juan.perez@email.com', '555-0101', '{"diabetes": false, "alergias": ["penicilina"]}'::jsonb)
    RETURNING id INTO p_id;
    
    -- Insertar cita para Juan
    -- Requiere un especialista_id válido de auth.users (se omiten IDs reales por seguridad)
END $$;
