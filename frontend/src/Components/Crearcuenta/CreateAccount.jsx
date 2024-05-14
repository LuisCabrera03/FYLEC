import { useState } from 'react';
import './CreateAccount.css';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';

function CreateAccount() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [correoEnUso, setCorreoEnUso] = useState(false);
  const history = useHistory();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/crear-cuenta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString().split('T')[0] : null
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada correctamente!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          history.push('/login');
        });
      } else if (response.status === 400) {
        const responseData = await response.json();
        if (responseData.error === 'El correo electrónico ya está en uso') {
          setCorreoEnUso(true);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: '¡El correo electrónico ya está en uso!',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: responseData.error,
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error interno del servidor. Por favor, inténtelo de nuevo más tarde.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al enviar los datos: ' + error.message,
      });
    }
  }
  const departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
    'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
    'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander',
    'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  const municipiosPorDepartamento = {
    'Amazonas': ['Leticia', 'Puerto Nariño', 'La Chorrera', 'Tarapacá', 'Puerto Santander', 'La Pedrera', 'Puerto Arica'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Rionegro', 'Turbo', 'Caucasia', 'Sabaneta', 'Girardota', 'La Estrella', 'Caldas', 'Copacabana', 'Barbosa'],
  };

  const handleDepartamentoChange = (e) => {
    setDepartamento(e.target.value);
    setMunicipio('');
  };

  return (
    <div className='login'>
      <div className="login-container-custom2">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <fieldset className='input-nombre'>
              <legend><label>¡Queremos conocerte!</label></legend>

              <label>Ingresa tu nombre completo</label>
              <input
                type="text"
                placeholder="Ejemplo: Juan Pérez"
                {...register('nombre', { required: true })}
              />
              {errors.nombre && <span className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert'  /> Este campo es requerido</span>}
            </fieldset>
          </div>
          <div>
            <fieldset className='input-nombre'>
              <label>Proporciona tu correo electrónico</label>
              <input
                type="email"
                placeholder="Ejemplo: ejemplo@gmail.com"
                {...register('correo', { required: true })}
              />
              {errors.correo && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert'  /> Este campo es requerido</span>
              }
              {correoEnUso && (
                <span className='alerts'>
                  <FontAwesomeIcon icon={faCircleExclamation} className='alert' />
                  ¡El correo electrónico ya está en uso!
                </span>
              )}
            </fieldset>
          </div>
          <div>
            <fieldset className='input-nombre'>
              <div className='input-contraseña'>
                <label>Elige una contraseña segura</label>
                <input
                  type="password"
                  placeholder="Elige una contraseña segura"
                  {...register('contraseña', { required: true })}
                />
                {errors.contraseña && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation}className='alert' /> Este campo es requerido</span>}
              </div>
              <div className='input-contraseña'>
                <label>Confirma tu contraseña</label>
                <input
                  type="password"
                  placeholder="Confirma tu contraseña"
                  {...register('confirmarContraseña', {
                    validate: value => value === watch('contraseña') || "Las contraseñas no coinciden"
                  })}
                />
                {errors.confirmarContraseña && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert'/> {errors.confirmarContraseña.message}</span>}
              </div>
            </fieldset>
          </div>

          <div>
            <fieldset className='input-nombre'>
              <label>Indica tu fecha de nacimiento</label>
              <DatePicker className='datepicker'
                selected={fechaNacimiento}
                onChange={(date) => setFechaNacimiento(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Ejemplo: 01/01/1990"
              />
              {errors.fechaNacimiento && <span className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert' /> Este campo es requerido</span>}
            </fieldset>
          </div>

          <div>
            <fieldset className='input-nombre'>
              <div className='input-contraseña'>
                <label>Selecciona tu tipo de documento</label>
                <select className='select' {...register('tipoDocumento', { required: true })}>
                  <option value="">Selecciona tu tipo de documento</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>

                {errors.tipoDocumento && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation}className='alert' /> Este campo es requerido</span>}
              </div>
              <div className='input-contraseña'>
                <label>Ingresa tu número de documento</label>
                <input
                  type="text"
                  placeholder="Ingresa tu número de documento"
                  {...register('numeroDocumento', { required: true })}
                />
                {errors.numeroDocumento && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation}className='alert' /> Este campo es requerido</span>}
              </div>
            </fieldset>
          </div>
          <div>
            <fieldset className='input-nombre'>
              <label>Indica tu género</label>
              <select className='select' {...register('sexo', { required: true })}>
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.sexo && <span  className='alerts'> <FontAwesomeIcon icon={faCircleExclamation}className='alert' /> Este campo es requerido</span>}
            </fieldset>
          </div>

          <div>
            <fieldset className='input-nombre'>
              <div className='input-contraseña'>
                <label>Selecciona tu departamento</label>
                <select className='select' {...register('departamento', { required: true })} value={departamento} onChange={handleDepartamentoChange}>
                  <option value="">Selecciona tu departamento</option>
                  {departamentos.map((depto, index) => (
                    <option key={index} value={depto}>{depto}</option>
                  ))}
                </select>
                {errors.departamento && <span className='alerts'><FontAwesomeIcon icon={faCircleExclamation}className='alert'/> Este campo es requerido</span>}
              </div>
              <div className='input-contraseña'>
                <label>Selecciona tu municipio</label>
                <select className='select'{...register('municipio', { required: true })} value={municipio} onChange={(e) => setMunicipio(e.target.value)}>
                  <option value="">Selecciona tu municipio</option>
                  {municipiosPorDepartamento[departamento]?.map((mun, index) => (
                    <option key={index} value={mun}>{mun}</option>
                  ))}
                </select>
                {errors.municipio && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert' /> Este campo es requerido</span>}
              </div>
              <div className='input-contraseña'>
                <label>Proporciona tu dirección</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Calle 123"
                  {...register('direccion', { required: true })}
                />
                {errors.direccion && <span  className='alerts'><FontAwesomeIcon icon={faCircleExclamation} className='alert' /> Este campo es requerido</span>}
              </div>
            </fieldset>
          </div>

          <button type="submit" className="custom-button">Crear cuenta</button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;