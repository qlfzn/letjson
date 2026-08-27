function parseJSON() {
    const rawJson = document.getElementById('jsonField').value;
    const error = document.getElementById('error');
    const form = document.getElementById('jsonForm');

    try {
        const data = JSON.parse(rawJson);
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
            throw new Error('Top level must be a single JSON object, not array.');
        }
        error.textContent = '';
        form.innerHTML = '';
        buildForm(data, '', form);
        setStep(2);
    } catch (e) {
        error.textContent = e.message;
        setStep(1);
    }
}

function setStep(n) {
    document.querySelectorAll('.progress .step').forEach((step) => {
        const s = Number(step.dataset.step);
        step.classList.toggle('done', s < n);
        step.classList.toggle('active', s === n);
    });
}

function buildForm(obj, path, container) {
    for (const key in obj) {
        const value = obj[key];
        const childPath = path ? path + '.' + key : key;

        if (Array.isArray(value)) {
            const isObjectArray = value.length > 0 && typeof value[0] === 'object' && value[0] !== null;

            if (isObjectArray) {
                const wrap = document.createElement('fieldset');
                const legend = document.createElement('legend');
                legend.textContent = key + ' (array)';
                wrap.appendChild(legend);

                value.forEach((item, i) => {
                    const itemFs = document.createElement('fieldset');
                    const itemLegend = document.createElement('legend');
                    itemLegend.textContent = key + ' ' + i;
                    itemFs.appendChild(itemLegend);
                    buildForm(item, childPath + '.' + i, itemFs);
                    wrap.appendChild(itemFs);
                });
                container.appendChild(wrap);
            } else {
                const label = document.createElement('label');
                label.textContent = key;
                const ta = document.createElement('textarea');
                ta.value = JSON.stringify(value, null, 2);
                ta.dataset.path = childPath;
                ta.dataset.type = 'array';
                label.appendChild(ta);
                container.appendChild(label);
            }
            continue;
        }

        if (value !== null && typeof value === 'object') {
            const fs = document.createElement('fieldset');
            const legend = document.createElement('legend');
            legend.textContent = key;
            fs.appendChild(legend);
            buildForm(value, childPath, fs);
            container.appendChild(fs);
            continue;
        }

        const label = document.createElement('label');
        label.textContent = key;
        const input = document.createElement('input');
        input.dataset.path = childPath;

        if (typeof value === 'number') {
            input.type = 'number';
            input.value = value;
            input.dataset.type = 'number';
        } else if (typeof value === 'boolean') {
            input.type = 'checkbox';
            input.checked = value;
            input.dataset.type = 'boolean';
        } else {
            input.type = 'text';
            input.value = value ?? '';
            input.dataset.type = 'text';
        }

        label.appendChild(input);
        container.appendChild(label);
    }
}

function generateJSON() {
    const form = document.getElementById('jsonForm');
    const output = document.getElementById('output');
    const result = {};

    const fields = form.querySelectorAll('input, textarea');
    fields.forEach((el) => {
        const path = el.dataset.path;
        const type = el.dataset.type;
        let value;

        if (type === 'number') {
            value = Number(el.value);
        } else if (type === 'boolean') {
            value = el.checked;
        } else if (type === 'array') {
            try {
                value = JSON.parse(el.value);
            } catch {
                value = el.value;
            }
        } else {
            value = el.value;
        }

        setValueAtPath(result, path, value);
    });

    output.textContent = JSON.stringify(result, null, 2);
    setStep(3);
}

function setValueAtPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
            current[key] = isNumeric(keys[i + 1]) ? [] : {};
        }
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
}

function isNumeric(str) {
    return /^\d+$/.test(str);
}

function copyJSON() {
    const text = document.getElementById('output').textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('button[onclick="copyJSON()"]');
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 1500);
    });
}

function downloadJSON() {
    const text = document.getElementById('output').textContent;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
}

setStep(1);