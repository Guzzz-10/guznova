// Abre el navegador en el sitio cuando el servidor ya está escuchando
// (lo usan iniciar.bat e iniciar.command). Se rinde a los 10 minutos.
import net from "node:net";
import { exec } from "node:child_process";

const PORT = 3000;
const URL = `http://localhost:${PORT}`;
const limite = Date.now() + 10 * 60 * 1000;

function abrir() {
  const cmd =
    process.platform === "win32" ? `start "" "${URL}"` : process.platform === "darwin" ? `open "${URL}"` : `xdg-open "${URL}"`;
  exec(cmd, () => process.exit(0));
}

(function probar() {
  const socket = net.connect({ port: PORT, host: "localhost" });
  socket.once("connect", () => {
    socket.destroy();
    abrir();
  });
  socket.once("error", () => {
    socket.destroy();
    if (Date.now() > limite) process.exit(0);
    setTimeout(probar, 1500);
  });
})();
