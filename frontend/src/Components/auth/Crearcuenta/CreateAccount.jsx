import { useState, useRef, useEffect } from 'react';
import './CreateAccount.css';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateAccount() {
  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue, reset } = useForm();
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamento, setDepartamento] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [correoEnUso, setCorreoEnUso] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const history = useHistory();

  const inputRefs = useRef({});

  useEffect(() => {
    // Cargar datos del formulario desde localStorage si existen
    const savedData = localStorage.getItem('createAccountData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);
      setFechaNacimiento(parsedData.fechaNacimiento ? new Date(parsedData.fechaNacimiento) : null);
      setDepartamento(parsedData.departamento || '');
      setMunicipio(parsedData.municipio || '');
      setAceptaTerminos(parsedData.aceptaTerminos || false);
      setStep(parsedData.step || 1);
    }
  }, [reset]);

  // Cargar los departamentos desde API-Colombia al montar el componente
  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/Department', {
      headers: { 'accept': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setDepartamentos(data))
      .catch(error => console.error('Error al cargar los departamentos:', error));
  }, []);

  // Cargar los municipios según el departamento seleccionado
  useEffect(() => {
    const selectedDepartamento = departamentos.find(dep => dep.name === departamento);
    if (selectedDepartamento) {
      fetch(`https://api-colombia.com/api/v1/Department/${selectedDepartamento.id}/cities`, {
        headers: { 'accept': 'application/json' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => setMunicipios(data))
        .catch(error => console.error('Error al cargar los municipios:', error));
    }
  }, [departamento, departamentos]);

  const saveFormDataToLocalStorage = () => {
    const formData = {
      ...watch(),
      fechaNacimiento: fechaNacimiento ? fechaNacimiento.toISOString() : null,
      departamento,
      municipio,
      aceptaTerminos,
      step,
    };
    localStorage.setItem('createAccountData', JSON.stringify(formData));
  };

  const onSubmit = async (data) => {
    if (!aceptaTerminos) {
      toast.error('Debe aceptar los términos y condiciones para continuar.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

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
        toast.success('¡Cuenta creada correctamente!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          localStorage.removeItem('createAccountData'); // Limpiar el almacenamiento local al crear la cuenta
          history.push('/login');
        }, 2100);
      } else if (response.status === 400) {
        const responseData = await response.json();
        if (responseData.error === 'El correo electrónico ya está en uso') {
          setCorreoEnUso(true);
          toast.error('¡El correo electrónico ya está en uso!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } else {
          toast.error(responseData.error, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      } else {
        toast.error('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`Error al enviar los datos: ${error.message}`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(stepFields[step - 1]);
    if (isValid) {
      setStep(step + 1);
    } else {
      for (const field of stepFields[step - 1]) {
        if (errors[field]) {
          inputRefs.current[field].focus();
          break;
        }
      }
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleNameBlur = (event) => {
    const value = event.target.value;
    const formattedName = value.replace(/\b\w/g, char => char.toUpperCase());
    setValue('nombre', formattedName, { shouldValidate: true });
  };

  const handleDateChange = (date) => {
    setFechaNacimiento(date);
    setValue('fechaNacimiento', date, { shouldValidate: true });
  };

  const handleDepartamentoChange = (e) => {
    const selectedDepartamento = e.target.value;
    setDepartamento(selectedDepartamento);
    setMunicipio('');
    setValue('departamento', selectedDepartamento, { shouldValidate: true });
    setValue('municipio', '', { shouldValidate: true });
  };

  const handleMunicipioChange = (e) => {
    const selectedMunicipio = e.target.value;
    setMunicipio(selectedMunicipio);
    setValue('municipio', selectedMunicipio, { shouldValidate: true });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const stepFields = [
    ['nombre', 'correo'],
    ['contraseña', 'confirmarContraseña'],
    ['fechaNacimiento', 'tipoDocumento', 'numeroDocumento', 'sexo'],
    ['departamento', 'municipio', 'direccion']
  ];

  return (
    <div className='container-account'>
      <div className='create-account'>
        <div className='container-all'>
          <ToastContainer />
          <form onSubmit={handleSubmit(onSubmit)} className="form">
            {step === 1 && (
              <div className="form-step">
                <h2>Información Personal</h2>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ejemplo: Juan Pérez"
                    {...register('nombre', { required: true })}
                    className={errors.nombre ? 'input-error' : ''}
                    onBlur={handleNameBlur}
                  />
                  {errors.nombre && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="Ejemplo: ejemplo@gmail.com"
                    {...register('correo', { required: true })}
                    className={errors.correo ? 'input-error' : ''}
                  />
                  {errors.correo && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                  {correoEnUso && (
                    <span className='alert'>
                      <FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' />
                      ¡El correo electrónico ya está en uso!
                    </span>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Seguridad</h2>
                <div className="form-group password-group">
                  <label>Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Elige una contraseña segura"
                    {...register('contraseña', { required: true })}
                    className={errors.contraseña ? 'input-error' : ''}
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="password-icon"
                    onClick={togglePasswordVisibility}
                  />
                  {errors.contraseña && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group password-group">
                  <label>Confirmar Contraseña</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu contraseña"
                    {...register('confirmarContraseña', {
                      validate: value => value === watch('contraseña') || "Las contraseñas no coinciden"
                    })}
                    className={errors.confirmarContraseña ? 'input-error' : ''}
                  />
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="password-icon"
                    onClick={toggleConfirmPasswordVisibility}
                  />
                  {errors.confirmarContraseña && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> {errors.confirmarContraseña.message}</span>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <h2>Datos Personales</h2>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <DatePicker
                    selected={fechaNacimiento}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Ejemplo: 01/01/1990"
                    className={errors.fechaNacimiento ? 'input-error' : ''}
                  />
                  {errors.fechaNacimiento && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Tipo de Documento</label>
                  <select {...register('tipoDocumento', { required: true })} className={errors.tipoDocumento ? 'input-error' : ''}>
                    <option value="">Selecciona tu tipo de documento</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                  {errors.tipoDocumento && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Número de Documento</label>
                  <input
                    type="text"
                    placeholder="Ingresa tu número de documento"
                    {...register('numeroDocumento', { required: true })}
                    className={errors.numeroDocumento ? 'input-error' : ''}
                  />
                  {errors.numeroDocumento && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Género</label>
                  <select {...register('sexo', { required: true })} className={errors.sexo ? 'input-error' : ''}>
                    <option value="">Selecciona tu género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.sexo && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="form-step">
                <h2>Ubicación</h2>
                <div className="form-group">
                  <label>Departamento</label>
                  <select value={departamento} onChange={handleDepartamentoChange} className={errors.departamento ? 'input-error' : ''}>
                    <option value="">Selecciona tu departamento</option>
                    {departamentos.map((depto) => (
                      <option key={depto.id} value={depto.name}>{depto.name}</option>
                    ))}
                  </select>
                  {errors.departamento && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Municipio</label>
                  <select value={municipio} onChange={handleMunicipioChange} disabled={!departamento} className={errors.municipio ? 'input-error' : ''}>
                    <option value="">Selecciona tu municipio</option>
                    {municipios.map((mun) => (
                      <option key={mun.id} value={mun.name}>{mun.name}</option>
                    ))}
                  </select>
                  {errors.municipio && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    placeholder="Ejemplo: Calle 123"
                    {...register('direccion', { required: true })}
                    className={errors.direccion ? 'input-error' : ''}
                  />
                  {errors.direccion && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Este campo es requerido</span>}
                </div>

                <div className="check-terminos">
                  <input
                    type="checkbox"
                    id="terminos"
                    {...register('terminos', { required: true })}
                    checked={aceptaTerminos}
                    onChange={() => setAceptaTerminos(!aceptaTerminos)}
                  />
                  <label htmlFor="terminos" className='check-terminos'>
                    Acepto los <a href="#" onClick={() => {
                      saveFormDataToLocalStorage(); // Guardar datos antes de redirigir
                      history.push('/terminos');
                    }}>términos y condiciones</a>
                  </label>
                  {errors.terminos && <span className='alert'><FontAwesomeIcon icon={faCircleExclamation} className='alert-icon' /> Debe aceptar los términos y condiciones</span>}
                </div>
              </div>
            )}

            <div className="step-navigation">
              {step > 1 && <button type="button" className="custom-button" onClick={handlePreviousStep}>Anterior</button>}
              {step < 4 ? (
                <button type="button" className="custom-button" onClick={handleNextStep}>Siguiente</button>
              ) : (
                <button type="submit" className="custom-button">Crear cuenta</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAccount;
