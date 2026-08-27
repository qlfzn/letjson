function validateJSON() {
    const values = document.getElementById('jsonField').value;
    const outputElement = document.getElementById('object');

    try {
        let object = JSON.parse(values);
        let result = JSON.stringify(object, null, 2);
        outputElement.textContent = result;
    } catch (e) {
        outputElement.textContent = e.message;
    }
}

function parseType() {
    const object = document.getElementById('jsonField').value;
    const outputType = document.getElementById('objectType')

    outputType.textContent = "";

    let objectParsed = JSON.parse(object);

    let resultsList = "";

    for (let key in objectParsed) {
        let dataType = typeof (objectParsed[key]);
        resultsList += `Key: "${key}" is type: ${dataType}\n`;
    }

    outputType.textContent = resultsList;
}

function createInputField(jsonObject) {
    const container = document.getElementById('inputContainer');

    for (let key in jsonObject) {
        let inputField = document.createElement('input');

        // set input type based on value type
        let valueType = typeof jsonObject[key];
        switch (valueType) {
            case 'string':
                inputField.type = 'text';
                break;
            case 'number':
                inputField.type = 'number';
                break;
            case 'boolean':
                inputField.type = 'checkbox';
                inputField.checked = jsonObject[key];
                break;
            default:
                inputField.type = 'text';
        }
    }
}