// Registro de salas. Cada sala vira uma cena com o mesmo id (k.go("<id>")).
// Para criar uma sala nova: copie um arquivo desta pasta e adicione aqui.

import { quartoUm } from "./quarto_um.js";
import { corredor } from "./corredor.js";
import { quartoDois } from "./quarto_dois.js";
import { sala } from "./sala.js";
import { cozinha } from "./cozinha.js";

export const ROOMS = [quartoUm, corredor, quartoDois, sala, cozinha];
