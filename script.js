let currentInput = ''; 
let activeField = ''; 
let values = { peso: 0, altura: 0, volume: 0, tempo: 0 }; 
let tempoUnidade = 'horas'; 

// 1. ESCUTADOR DE TECLADO FÍSICO
document.addEventListener('keydown', (event) => {
    if (!activeField) return; 
    if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        pressNum(parseInt(event.key));
    } 
    else if (event.key === 'Backspace') {
        event.preventDefault();
        pressDelete();
    } 
    else if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        closeKeyboard();
    }
});

// --- NOVO: FECHAR AO CLICAR FORA (ADICIONADO AQUI) ---
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('keyboard-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(event) {
            // Se o clique foi no fundo escuro e não na caixa branca do teclado
            if (event.target === this) {
                closeKeyboard();
            }
        });
    }
});
// ----------------------------------------------------

function openKeyboard(field) {
    // 1. Limpa o foco de qualquer outro campo aberto
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('focused'));
    
    activeField = field;
    currentInput = ''; 
    
    const displayElement = document.getElementById(`display-${field}`);
    if (displayElement) {
        // 2. Adiciona a classe que faz o campo "flutuar" no CSS
        const parent = displayElement.parentElement;
        parent.classList.add('focused');
        
        // 3. AUTO-SCROLL: Faz a página subir para o topo
        // Isso garante que o topo do app cole no topo do navegador, 
        // abrindo o máximo de espaço possível embaixo para o teclado.
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 4. Atualiza título e mostra o teclado
    document.getElementById('keyboard-title').innerText = `Inserindo ${field.toUpperCase()}`;
    document.getElementById('keyboard-overlay').classList.add('active');
}

function closeKeyboard() {
    document.getElementById('keyboard-overlay').classList.remove('active');
    document.querySelectorAll('.input-field').forEach(el => el.classList.remove('focused'));
    activeField = '';
}

function pressNum(num) {
    if (currentInput.length < 6) {
        currentInput += num;
        updateDisplay();
    }
}

function pressDelete() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    let rawValue = currentInput === '' ? '0' : currentInput;
    let floatValue = parseFloat(rawValue) / 100;
    values[activeField] = floatValue;

    let formatted = floatValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    let unit = "";
    if (activeField === 'peso') unit = "kg";
    else if (activeField === 'altura') unit = "m";
    else if (activeField === 'volume') unit = "ml";
    else if (activeField === 'tempo') unit = (tempoUnidade === 'horas' ? 'h' : 'min');

    const display = document.getElementById(`display-${activeField}`);
    if (display) {
        display.innerHTML = `${formatted}<span>${unit}</span>`;
    }
}

function toggleTimeUnit(unidade) {
    tempoUnidade = unidade;
    if (values.tempo > 0 || currentInput !== '') {
        updateDisplay(); 
    } else {
        const span = document.querySelector('#display-tempo span');
        if (span) span.innerText = unidade === 'horas' ? 'h' : 'min';
    }
}

function showAlert(msg) {
    document.getElementById('alert-message').innerText = msg;
    document.getElementById('custom-alert').style.display = 'flex';
}

function closeAlert() {
    document.getElementById('custom-alert').style.display = 'none';
}

function calcularIMC() {
    const p = values.peso;
    const a = values.altura;
    const resDiv = document.getElementById('resultado');

    if (p > 0 && a > 0) {
        const imc = (p / (a * a)).toFixed(1);
        let cor = imc >= 25 ? "#d9534f" : "#2d6a4f";
        resDiv.style.display = 'block';
        resDiv.style.border = `2px solid ${cor}`;
        resDiv.innerHTML = `<h3>Seu IMC: ${imc}</h3><p>Classificação conforme tabela oficial.</p>`;
    } else {
        showAlert("Informe o peso e a altura corretamente.");
    }
}

function calcularGotejamento() {
    const v = values.volume;
    const t = values.tempo;
    const resDiv = document.getElementById('resultado');

    if (v > 0 && t > 0) {
        let gotas, microgotas;
        if (tempoUnidade === 'horas') {
            gotas = Math.round(v / (t * 3));
            microgotas = Math.round(v / t);
        } else {
            gotas = Math.round((v * 20) / t);
            microgotas = Math.round((v * 60) / t);
        }

        resDiv.style.display = 'block';
        resDiv.style.border = `2px solid var(--primary)`;
        resDiv.innerHTML = `
            <h2 style="color:var(--primary)">Resultado</h2>
            <div style="background:#f0f7f3; padding:15px; border-radius:12px; margin-top:10px;">
                <b style="font-size:1.4rem;">${gotas} gtt/min</b><br>
                <small>${microgotas} mcgtt/min</small>
            </div>
        `;
    } else {
        showAlert("Informe o volume e o tempo corretamente.");
    }
}