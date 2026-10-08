/* =========================================================
   PLATAFORMA CORPORATIVA - SENAI
   JavaScript puro para facilitar a explicação em sala.
   Os dados ficam no localStorage apenas para demonstração.
   ========================================================= */

const STORAGE_KEY = "plataforma_corporativa_senai";

const INITIAL_STATE = {
    currentUser: null,
    users: [
        {
            id: "u1",
            nome: "Marcelo Oliveira",
            email: "marcelo@empresa.com.br",
            senha: "123456",
            role: "colaborador",
            cursoId: null,
            aceitouLGPD: true
        },
        {
            id: "rh1",
            nome: "Gestor de RH",
            email: "rh@empresa.com.br",
            senha: "123456",
            role: "rh",
            cursoId: null,
            aceitouLGPD: true
        }
    ],
    progress: {},
    presencial: {},
    certificates: []
};

const COURSES = [
    {
        id: "curso-seguranca",
        titulo: "Segurança no Ambiente de Trabalho",
        tipo: "Presencial",
        carga: "4 horas",
        descricao: "Boas práticas para prevenção de acidentes, postura profissional e segurança no cotidiano da empresa.",
        obrigatorio: true,
        data: "24/10/2026",
        horario: "09:00 às 13:00",
        endereco: "Centro de Treinamento da Empresa — Av. Exemplo, 1000 — São Paulo/SP",
        aulas: [
            {
                id: "seg-1",
                titulo: "Aula presencial — Segurança e prevenção",
                descricao: "Encontro presencial com orientações práticas de segurança no ambiente de trabalho.",
                duracao: "4 horas"
            }
        ]
    },
    {
        id: "curso-comunicacao",
        titulo: "Comunicação Profissional e Trabalho em Equipe",
        tipo: "Gravado",
        carga: "3 horas",
        descricao: "Comunicação clara, colaboração, respeito, feedback e relacionamento saudável no ambiente profissional.",
        obrigatorio: true,
        aulas: [
            {
                id: "com-1",
                titulo: "Vídeo 1 — Comunicação no trabalho",
                descricao: "Princípios de comunicação clara e objetiva.",
                duracao: "30 min"
            },
            {
                id: "com-2",
                titulo: "Vídeo 2 — Trabalho em equipe",
                descricao: "Colaboração, responsabilidades e respeito entre colegas.",
                duracao: "30 min"
            },
            {
                id: "com-3",
                titulo: "Vídeo 3 — Feedback profissional",
                descricao: "Como dar e receber feedback de forma respeitosa.",
                duracao: "30 min"
            }
        ]
    }
];

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(INITIAL_STATE);

    try {
        return JSON.parse(saved);
    } catch {
        return structuredClone(INITIAL_STATE);
    }
}

let state = loadState();

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(text) {
    return String(text ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getCourse(courseId) {
    return COURSES.find(c => c.id === courseId);
}

function getUser() {
    return state.users.find(u => u.id === state.currentUser);
}

function progressFor(userId, courseId) {
    const course = getCourse(courseId);
    if (!course) return 0;

    if (course.tipo === "Presencial") {
        return state.presencial[`${userId}_${courseId}`] ? 100 : 0;
    }

    const done = (state.progress[userId]?.[courseId] || []).length;
    return Math.round((done / course.aulas.length) * 100);
}

function sponsorHeader() {
    return `
        <header class="topbar">
            <div class="brand">
                <div class="brand-mark">TC</div>
                <span>Trilha Corporativa</span>
            </div>
            <div class="sponsor">
                <span>Patrocinador</span>
                <img src="assets/logo-patrocinador.svg" alt="Logo do patrocinador">
            </div>
        </header>
    `;
}

function footer() {
    return `
        <div class="footer">
            Protótipo acadêmico — SENAI | Plataforma de capacitação corporativa
        </div>
    `;
}

function layout(content, withHeader = true) {
    return `
        <div class="page">
            ${withHeader ? sponsorHeader() : ""}
            <main class="content">
                <div class="container">${content}</div>
            </main>
            ${footer()}
        </div>
    `;
}

function render() {
    if (!state.currentUser) {
        renderLogin();
        return;
    }

    const user = getUser();

    if (user.role === "rh") {
        renderRH();
    } else {
        renderCollaborator();
    }
}

/* =========================================================
   LOGIN / CADASTRO
   ========================================================= */

function renderLogin(mode = "login", message = "") {
    const isLogin = mode === "login";

    document.getElementById("app").innerHTML = `
        <div class="auth-wrap">
            <section class="auth-info">
                <div class="brand" style="color:white;">
                    <div class="brand-mark" style="background:white;color:#0b3d91;">TC</div>
                    <span>Trilha Corporativa</span>
                </div>

                <h1>Capacitação em um só lugar.</h1>

                <p>
                    Plataforma de treinamento corporativo para colaboradores,
                    gestores de RH e acompanhamento de cursos obrigatórios.
                </p>

                <p class="small">
                    Protótipo desenvolvido para apresentação do exercício final do SENAI.
                </p>
            </section>

            <section class="auth-box">
                <div class="auth-card">
                    ${isLogin ? loginForm(message) : registerForm(message)}
                </div>
            </section>
        </div>
    `;
}

function loginForm(message) {
    return `
        <h2>Acessar plataforma</h2>
        <p class="muted">Entre com seu e-mail corporativo.</p>

        ${message ? `<div class="alert alert-error">${esc(message)}</div>` : ""}

        <form id="loginForm">
            <div class="field">
                <label for="email">E-mail corporativo</label>
                <input id="email" type="email" required placeholder="nome@empresa.com.br">
            </div>

            <div class="field">
                <label for="senha">Senha</label>
                <input id="senha" type="password" required placeholder="••••••">
            </div>

            <button class="btn btn-primary" style="width:100%;" type="submit">
                Entrar
            </button>
        </form>

        <p class="small muted" style="margin-top:18px;">
            Demonstração: colaborador <strong>marcelo@empresa.com.br</strong> /
            senha <strong>123456</strong><br>
            RH <strong>rh@empresa.com.br</strong> / senha <strong>123456</strong>
        </p>

        <hr style="border:0;border-top:1px solid #eee;margin:24px 0;">

        <p class="small">
            Ainda não possui conta?
            <button class="link-button" onclick="renderLogin('register')">Criar conta</button>
        </p>
    `;
}

function registerForm(message) {
    return `
        <h2>Criar conta</h2>
        <p class="muted">Cadastro permitido somente com e-mail da empresa.</p>

        ${message ? `<div class="alert alert-error">${esc(message)}</div>` : ""}

        <form id="registerForm">
            <div class="field">
                <label for="nome">Nome completo</label>
                <input id="nome" required placeholder="Seu nome">
            </div>

            <div class="field">
                <label for="email">E-mail corporativo</label>
                <input id="email" type="email" required placeholder="nome@empresa.com.br">
            </div>

            <div class="field">
                <label for="senha">Senha</label>
                <input id="senha" type="password" minlength="6" required placeholder="Mínimo de 6 caracteres">
            </div>

            <div class="checkbox">
                <input id="lgpd" type="checkbox" required>
                <label for="lgpd">
                    Concordo com os Termos de Uso e com o tratamento dos meus dados
                    pessoais para fins de cadastro, controle de cursos e emissão de
                    certificado, conforme a LGPD e as políticas da empresa.
                </label>
            </div>

            <button class="btn btn-primary" style="width:100%;" type="submit">
                Criar conta
            </button>
        </form>

        <p class="small" style="margin-top:18px;">
            <button class="link-button" onclick="renderLogin('login')">
                Voltar para o login
            </button>
        </p>
    `;
}

document.addEventListener("submit", event => {
    if (event.target.id === "loginForm") {
        event.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;

        const user = state.users.find(u => u.email === email && u.senha === senha);

        if (!user) {
            renderLogin("login", "E-mail ou senha inválidos.");
            return;
        }

        state.currentUser = user.id;
        saveState();
        render();
    }

    if (event.target.id === "registerForm") {
        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const senha = document.getElementById("senha").value;
        const lgpd = document.getElementById("lgpd").checked;

        // Regra de negócio: somente domínio corporativo.
        if (!email.endsWith("@empresa.com.br")) {
            renderLogin("register", "Use um e-mail corporativo terminado em @empresa.com.br.");
            return;
        }

        if (state.users.some(u => u.email === email)) {
            renderLogin("register", "Este e-mail já está cadastrado.");
            return;
        }

        const newUser = {
            id: "u_" + Date.now(),
            nome,
            email,
            senha,
            role: "colaborador",
            cursoId: null,
            aceitouLGPD: lgpd
        };

        state.users.push(newUser);
        state.currentUser = newUser.id;
        saveState();
        render();
    }
});

/* =========================================================
   PAINEL DO COLABORADOR
   ========================================================= */

function renderCollaborator() {
    const user = getUser();
    const selectedCourse = user.cursoId ? getCourse(user.cursoId) : null;

    const cards = COURSES.map(course => {
        const progress = progressFor(user.id, course.id);
        const disabled = selectedCourse && selectedCourse.id !== course.id;

        return `
            <article class="card course-card">
                <span class="course-type ${course.tipo === "Presencial" ? "presencial" : ""}">
                    ${course.tipo}
                </span>

                <h3>${esc(course.titulo)}</h3>
                <p class="muted">${esc(course.descricao)}</p>

                <ul class="info-list">
                    <li><strong>Carga horária:</strong> ${esc(course.carga)}</li>
                    <li><strong>Módulos:</strong> 1</li>
                    <li><strong>Obrigatório:</strong> ${course.obrigatorio ? "Sim" : "Não"}</li>
                </ul>

                <div class="progress-row">
                    <span>Progresso</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width:${progress}%"></div>
                </div>

                <div class="bottom" style="margin-top:18px;">
                    ${
                        disabled
                        ? `<span class="muted small">Finalize o curso atual para escolher outro.</span>`
                        : `<button class="btn btn-primary" onclick="openCourse('${course.id}')">
                                ${selectedCourse?.id === course.id ? "Continuar curso" : "Escolher curso"}
                           </button>`
                    }
                    ${
                        progress === 100
                        ? `<button class="btn btn-success" onclick="openCertificate('${course.id}')">Certificado</button>`
                        : ""
                    }
                </div>
            </article>
        `;
    }).join("");

    const courseProgress = selectedCourse ? progressFor(user.id, selectedCourse.id) : 0;

    document.getElementById("app").innerHTML = sponsorHeader() + `
        <main class="content">
            <div class="container">
                <div class="toolbar">
                    <div>
                        <h2 style="margin-bottom:5px;">Olá, ${esc(user.nome)}!</h2>
                        <span class="muted">Painel do colaborador</span>
                    </div>

                    <div class="toolbar-actions">
                        <button class="btn btn-light" onclick="logout()">Sair</button>
                    </div>
                </div>

                <div class="grid-3">
                    <div class="card kpi">
                        <span class="muted small">Curso escolhido</span>
                        <strong>${selectedCourse ? "1" : "0"}</strong>
                        <span class="muted">${selectedCourse ? esc(selectedCourse.titulo) : "Nenhum curso"}</span>
                    </div>

                    <div class="card kpi">
                        <span class="muted small">Progresso atual</span>
                        <strong>${courseProgress}%</strong>
                        <span class="${courseProgress === 100 ? "status-ok" : "status-warn"}">
                            ${courseProgress === 100 ? "Concluído" : "Em andamento"}
                        </span>
                    </div>

                    <div class="card kpi">
                        <span class="muted small">Cursos obrigatórios</span>
                        <strong>${selectedCourse ? "1" : "0"}</strong>
                        <span class="muted">${selectedCourse ? "Acompanhe sua conclusão" : "Escolha um curso"}</span>
                    </div>
                </div>

                <div class="section-title">
                    <div>
                        <h2>Catálogo de cursos</h2>
                        <p class="muted">Cada curso possui apenas 1 módulo e não possui material complementar.</p>
                    </div>
                </div>

                <div class="grid-2">
                    ${cards}
                </div>
            </div>
        </main>

        ${footer()}
    `;
}

/* =========================================================
   PÁGINA DO CURSO
   ========================================================= */

function openCourse(courseId) {
    const user = getUser();
    const course = getCourse(courseId);

    if (!course) return;

    // Regra: colaborador pode ter apenas um curso até finalizar.
    if (user.cursoId && user.cursoId !== courseId) {
        alert("Você já possui um curso em andamento. Finalize-o antes de escolher outro.");
        return;
    }

    if (!user.cursoId) {
        user.cursoId = courseId;
        saveState();
    }

    const progress = progressFor(user.id, courseId);
    const doneLessons = state.progress[user.id]?.[courseId] || [];

    const lessons = course.aulas.map((aula, index) => {
        const done = doneLessons.includes(aula.id);

        if (course.tipo === "Presencial") {
            const presence = state.presencial[`${user.id}_${courseId}`];
            return `
                <div class="lesson ${presence ? "done" : ""}">
                    <div>
                        <div class="lesson-title">${esc(aula.titulo)}</div>
                        <div class="muted small">${esc(aula.descricao)} — ${esc(aula.duracao)}</div>
                    </div>
                    <span class="badge ${presence ? "ok" : ""}">
                        ${presence ? "Presença registrada" : "Aguardando presença do RH"}
                    </span>
                </div>
            `;
        }

        return `
            <div class="lesson ${done ? "done" : ""}">
                <div>
                    <div class="lesson-title">${esc(aula.titulo)}</div>
                    <div class="muted small">${esc(aula.descricao)} — ${esc(aula.duracao)}</div>
                </div>

                <button
                    class="btn ${done ? "btn-success" : "btn-primary"}"
                    onclick="toggleLesson('${courseId}','${aula.id}')"
                >
                    ${done ? "Vídeo concluído" : "Marcar vídeo como assistido"}
                </button>
            </div>
        `;
    }).join("");

    const certificateButton = progress === 100
        ? `<button class="btn btn-success" onclick="openCertificate('${courseId}')">Gerar certificado</button>`
        : `<button class="btn btn-light" disabled>Certificado liberado em 100%</button>`;

    document.getElementById("app").innerHTML = sponsorHeader() + `
        <main class="content">
            <div class="container">
                <div class="toolbar">
                    <div>
                        <button class="btn btn-light" onclick="render()">← Voltar ao painel</button>
                    </div>
                    <div>
                        <span class="muted small">Patrocinador presente em todas as páginas</span>
                    </div>
                </div>

                <div class="hero">
                    <span class="course-type" style="background:rgba(255,255,255,.18);color:white;">
                        ${esc(course.tipo)}
                    </span>
                    <h1>${esc(course.titulo)}</h1>
                    <p>${esc(course.descricao)}</p>
                </div>

                <div class="grid-2">
                    <section class="card">
                        <h3>Informações do curso</h3>
                        <ul class="info-list">
                            <li><strong>Carga horária:</strong> ${esc(course.carga)}</li>
                            <li><strong>Módulos:</strong> 1</li>
                            <li><strong>Material complementar:</strong> Não</li>
                            <li><strong>Obrigatório:</strong> Sim</li>
                        </ul>

                        ${
                            course.tipo === "Presencial"
                            ? `
                                <div class="alert alert-info">
                                    <strong>Encontro presencial</strong><br>
                                    Data: ${esc(course.data)}<br>
                                    Horário: ${esc(course.horario)}<br>
                                    Endereço: ${esc(course.endereco)}
                                </div>
                            `
                            : `
                                <div class="video-box">
                                    <div>
                                        <div class="video-icon">▶</div>
                                        <strong>Aulas gravadas</strong>
                                        <p class="small">Neste protótipo, o botão representa o término de cada vídeo.</p>
                                    </div>
                                </div>
                            `
                        }
                    </section>

                    <section class="card">
                        <h3>Seu progresso</h3>

                        <div class="progress-row">
                            <span>Conclusão do curso</span>
                            <span>${progress}%</span>
                        </div>

                        <div class="progress">
                            <div class="progress-bar" style="width:${progress}%"></div>
                        </div>

                        <p class="muted small" style="margin-top:12px;">
                            O certificado só é liberado quando o curso chega a 100%.
                        </p>

                        <div style="margin-top:20px;">
                            ${certificateButton}
                        </div>
                    </section>
                </div>

                <div class="section-title">
                    <div>
                        <h2>Módulo 1</h2>
                        <p class="muted">Conteúdo do curso</p>
                    </div>
                </div>

                <div class="card">
                    <div class="lesson-list">
                        ${lessons}
                    </div>
                </div>
            </div>
        </main>
        ${footer()}
    `;
}

function toggleLesson(courseId, lessonId) {
    const user = getUser();

    if (!state.progress[user.id]) state.progress[user.id] = {};
    if (!state.progress[user.id][courseId]) state.progress[user.id][courseId] = [];

    const list = state.progress[user.id][courseId];

    if (list.includes(lessonId)) {
        state.progress[user.id][courseId] = list.filter(id => id !== lessonId);
    } else {
        list.push(lessonId);
    }

    saveState();
    openCourse(courseId);
}

/* =========================================================
   PAINEL DO RH
   ========================================================= */

function renderRH() {
    const collaborators = state.users.filter(u => u.role === "colaborador");

    const rows = collaborators.map(user => {
        const course = user.cursoId ? getCourse(user.cursoId) : null;
        const progress = course ? progressFor(user.id, course.id) : 0;
        const present = course?.tipo === "Presencial"
            ? !!state.presencial[`${user.id}_${course.id}`]
            : null;

        return `
            <tr>
                <td><strong>${esc(user.nome)}</strong><br><span class="muted">${esc(user.email)}</span></td>
                <td>${course ? esc(course.titulo) : "Não escolhido"}</td>
                <td>${course ? `${progress}%` : "—"}</td>
                <td>
                    ${
                        course?.tipo === "Presencial"
                        ? present
                            ? `<span class="status-ok">Presente</span>`
                            : `<button class="btn btn-secondary" onclick="registerPresence('${user.id}','${course.id}')">Registrar presença</button>`
                        : course
                            ? `<span class="muted">Aulas gravadas</span>`
                            : "—"
                    }
                </td>
                <td>
                    ${
                        progress === 100
                        ? `<span class="status-ok">Concluído</span>`
                        : `<span class="status-warn">Pendente</span>`
                    }
                </td>
            </tr>
        `;
    }).join("");

    const completed = collaborators.filter(u => u.cursoId && progressFor(u.id, u.cursoId) === 100).length;
    const mandatory = collaborators.filter(u => u.cursoId).length;

    document.getElementById("app").innerHTML = sponsorHeader() + `
        <main class="content">
            <div class="container">
                <div class="toolbar">
                    <div>
                        <h2 style="margin-bottom:5px;">Painel do Gestor de RH</h2>
                        <span class="muted">Acompanhamento dos cursos obrigatórios</span>
                    </div>
                    <button class="btn btn-light" onclick="logout()">Sair</button>
                </div>

                <div class="grid-3">
                    <div class="card kpi">
                        <span class="muted small">Colaboradores cadastrados</span>
                        <strong>${collaborators.length}</strong>
                    </div>

                    <div class="card kpi">
                        <span class="muted small">Com curso escolhido</span>
                        <strong>${mandatory}</strong>
                    </div>

                    <div class="card kpi">
                        <span class="muted small">Cursos concluídos</span>
                        <strong>${completed}</strong>
                    </div>
                </div>

                <div class="section-title">
                    <div>
                        <h2>Controle de cumprimento</h2>
                        <p class="muted">
                            O RH pode acompanhar o percentual e registrar presença dos encontros presenciais.
                        </p>
                    </div>
                </div>

                <div class="card">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Curso</th>
                                <th>Progresso</th>
                                <th>Presença</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows || `
                                <tr>
                                    <td colspan="5" class="muted">Nenhum colaborador cadastrado.</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
        ${footer()}
    `;
}

function registerPresence(userId, courseId) {
    state.presencial[`${userId}_${courseId}`] = true;
    saveState();
    renderRH();
}

/* =========================================================
   CERTIFICADO
   ========================================================= */

function openCertificate(courseId) {
    const user = getUser();
    const course = getCourse(courseId);

    if (!user || !course) return;

    const progress = progressFor(user.id, courseId);

    if (progress < 100) {
        alert("O certificado só pode ser gerado quando o curso estiver 100% concluído.");
        return;
    }

    const certificateId = `${user.id}_${courseId}`;

    if (!state.certificates.some(c => c.id === certificateId)) {
        state.certificates.push({
            id: certificateId,
            userId: user.id,
            courseId,
            data: new Date().toLocaleDateString("pt-BR")
        });
        saveState();
    }

    const modal = document.getElementById("certificateModal") || document.createElement("div");
    modal.id = "certificateModal";
    modal.className = "modal open";

    modal.innerHTML = `
        <div class="certificate">
            <p class="muted small">TRILHA CORPORATIVA</p>
            <h1>CERTIFICADO DE CONCLUSÃO</h1>

            <div class="line"></div>

            <p>Certificamos que</p>
            <strong>${esc(user.nome)}</strong>

            <p>
                concluiu o curso
                <strong>${esc(course.titulo)}</strong>,
                com carga horária de ${esc(course.carga)}.
            </p>

            <p class="muted">
                Conclusão: ${new Date().toLocaleDateString("pt-BR")}
            </p>

            <div class="line"></div>

            <p class="small">
                Certificado emitido eletronicamente pela plataforma de capacitação corporativa.
            </p>

            <div class="certificate-actions">
                <button class="btn btn-primary" onclick="window.print()">Imprimir / Salvar PDF</button>
                <button class="btn btn-light" onclick="closeCertificate()">Fechar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeCertificate() {
    const modal = document.getElementById("certificateModal");
    if (modal) modal.remove();
}

function logout() {
    state.currentUser = null;
    saveState();
    render();
}

/* Inicialização */
render();
