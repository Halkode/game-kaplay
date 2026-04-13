import { gameState } from "../state.js";
import { getSeverityLevel, getInjurySummary } from "../systems/injuries.js";

// Helper para converter o status do membro em uma cor visual RGB
function getStatusColor(k, status) {
    switch (status) {
        case "healthy": return k.rgb(100, 200, 100);   // Verde
        case "wounded": return k.rgb(220, 200, 80);    // Amarelo
        case "critical": return k.rgb(220, 100, 80);   // Laranja avermelhado
        case "disabled": return k.rgb(180, 50, 50);    // Vermelho escuro/sangue
        default: return k.rgb(200, 200, 200);
    }
}

export function showHealthPanel(k) {
    // ── PAINEL PRINCIPAL ──
    const panel = k.add([
        k.rect(220, 130, { radius: 4 }),
        k.pos(k.center().x, k.center().y),
        k.anchor("center"),
        k.color(20, 20, 24),
        k.outline(1, k.Color.fromHex("#555566")),
        k.fixed(),
        k.z(10000),
        k.area(),
        "healthPanel"
    ]);

    // Título
    panel.add([
        k.text("ESTADO DE SAÚDE", { size: 10 }),
        k.pos(0, -55),
        k.anchor("center"),
        k.color(200, 100, 100),
    ]);

    // ── LADO ESQUERDO: SILHUETA "FAKE 3D" ──
    const silhouetteAnchor = panel.add([
        k.pos(-60, 5), // Lado esquerdo do painel
    ]);

    const inj = gameState.injuries;

    // Cabeça
    silhouetteAnchor.add([
        k.circle(8),
        k.pos(0, -32),
        k.anchor("center"),
        k.color(getStatusColor(k, inj.head.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // Pescoço
    silhouetteAnchor.add([
        k.rect(6, 6),
        k.pos(0, -20),
        k.anchor("center"),
        k.color(getStatusColor(k, inj.torso.status)),
    ]);

    // Tórax
    silhouetteAnchor.add([
        k.rect(24, 30, { radius: 4 }),
        k.pos(0, 0),
        k.anchor("center"),
        k.color(getStatusColor(k, inj.torso.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // Braço Esquerdo (do ponto de vista do jogador -> lado direito do boneco)
    silhouetteAnchor.add([
        k.rect(8, 26, { radius: 4 }),
        k.pos(18, -4),
        k.anchor("center"),
        // Rotação suave pra parecer repouso
        k.rotate(15),
        k.color(getStatusColor(k, inj.leftArm.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // Braço Direito
    silhouetteAnchor.add([
        k.rect(8, 26, { radius: 4 }),
        k.pos(-18, -4),
        k.anchor("center"),
        k.rotate(-15),
        k.color(getStatusColor(k, inj.rightArm.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // Perna Esquerda
    silhouetteAnchor.add([
        k.rect(10, 32, { radius: 4 }),
        k.pos(7, 30),
        k.anchor("center"),
        k.color(getStatusColor(k, inj.leftLeg.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // Perna Direita
    silhouetteAnchor.add([
        k.rect(10, 32, { radius: 4 }),
        k.pos(-7, 30),
        k.anchor("center"),
        k.color(getStatusColor(k, inj.rightLeg.status)),
        k.outline(1, k.rgb(10,10,10))
    ]);

    // ── LADO DIREITO: LOG DE FERIMENTOS ──
    const logAnchor = panel.add([
        k.pos(10, -35), // Começa no topo direito
    ]);

    // Overall Status
    const severity = getSeverityLevel();
    let overallText = "OK";
    let overallColor = k.rgb(100, 200, 100);

    if (severity === "critical" || severity === "hemorrhage") {
        overallText = "CRÍTICO";
        overallColor = k.rgb(255, 50, 50);
    } else if (severity === "severe") {
        overallText = "GRAVE";
        overallColor = k.rgb(255, 120, 50);
    } else if (severity === "wounded") {
        overallText = "FERIDO";
        overallColor = k.rgb(220, 200, 50);
    }

    logAnchor.add([
        k.text("Overall Body Status", { size: 6 }),
        k.pos(0, 0),
        k.color(200, 200, 200)
    ]);
    
    logAnchor.add([
        k.text(overallText, { size: 8 }),
        k.pos(0, 8),
        k.color(overallColor)
    ]);

    // Separadorzinho
    logAnchor.add([
        k.rect(90, 1),
        k.pos(0, 20),
        k.color(60, 60, 70),
    ]);

    // Wounds list
    const injuries = getInjurySummary(); // retorna array ["Perna Direita: Fratura", ...]
    
    let yOffset = 26;
    if (injuries.length === 0) {
        logAnchor.add([
            k.text("Sem sangramentos\nou fraturas visíveis.", { size: 6, align: "left" }),
            k.pos(0, yOffset),
            k.color(150, 150, 150)
        ]);
    } else {
        // Renderizar até 4-5 machucados para não vazar a tela
        for (let i = 0; i < Math.min(injuries.length, 5); i++) {
            const parts = injuries[i].split(": "); 
            const member = parts[0]; 
            const wound = parts[1];

            logAnchor.add([
                k.text(member, { size: 6 }),
                k.pos(0, yOffset),
                k.color(220, 220, 220)
            ]);
            logAnchor.add([
                k.text(`- ${wound}`, { size: 6 }),
                k.pos(5, yOffset + 7),
                k.color(255, 100, 100)
            ]);
            yOffset += 18;
        }
        
        if (injuries.length > 5) {
            logAnchor.add([
                k.text(`... e mais ${injuries.length - 5}`, { size: 5 }),
                k.pos(0, yOffset),
                k.color(150, 150, 150)
            ]);
        }
    }

    // ── BOTÃO DE FECHAR ──
    const closeBtn = panel.add([
        k.rect(50, 14, { radius: 2 }),
        k.pos(60, 50), // Canto inferior direito
        k.anchor("center"),
        k.color(200, 50, 50),
        k.area()
    ]);

    closeBtn.add([
        k.text("Fechar", { size: 6 }),
        k.anchor("center"),
        k.color(255, 255, 255)
    ]);

    closeBtn.onHover(() => {
        k.setCursor("pointer");
        closeBtn.color = k.Color.fromHex("#ff5555");
    });

    closeBtn.onHoverEnd(() => {
        k.setCursor("default");
        closeBtn.color = k.Color.fromHex("#c83232");
    });

    closeBtn.onClick(() => {
        k.destroy(panel);
    });

    // Permitir fechar com Esc
    const escCmd = k.onKeyPress("escape", () => {
        k.destroy(panel);
    });
    panel.onDestroy(() => escCmd.cancel());

    return panel;
}
