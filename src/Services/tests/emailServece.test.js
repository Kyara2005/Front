// src/Services/tests/emailService.test.js
const { enviarCorreo } = require('../emailService');

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ mensaje: 'Correo enviado' }),
  })
);

test('enviarCorreo llama al backend y devuelve mensaje', async () => {
  const datos = { para: 'test@correo.com', asunto: 'Hola', mensaje: 'Prueba' };
  const resultado = await enviarCorreo(datos);

  expect(fetch).toHaveBeenCalled();
  expect(resultado.mensaje).toBe('Correo enviado');
});
