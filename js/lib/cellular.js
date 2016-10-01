const cellular = (function() {

    // Rule 73: http://atlas.wolfram.com/01/01/73/
    const rules = [
        [[1, 1, 1], 0],
        [[1, 1, 0], 1],
        [[1, 0, 1], 0],
        [[1, 0, 0], 0],
        [[0, 1, 1], 1],
        [[0, 1, 0], 0],
        [[0, 0, 1], 0],
        [[0, 0, 0], 1]
    ];

    function generateRow(numberOfColumns) {
        const row = new Array(numberOfColumns);
        for (let i = 0; i < numberOfColumns; i++) {
            row[i] = Math.round(Math.random());
        }
        return row;
    }

    function applyRules(previousRow, column) {
        const left = (column === 0) ? previousRow[previousRow.length - 1] : previousRow[column - 1];
        const above = previousRow[column];
        const right = (column >= previousRow.length - 1) ? previousRow[0] : previousRow[column + 1];

        const block = [left, above, right];

        // find the rule that matches block and get the new value
        return rules.find(rule => {
            return rule[0].every((c, i) => c == block[i])
        })[1];
    }

    function advanceRow(previousRow) {
        return previousRow.map((c, i) => {
            return applyRules(previousRow, i);
        });
    }

    function draw(context, rows, cellWidth, cellHeight, yOffSet) {
        context.strokeWidth = 0;

        context.fillStyle = '#000';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        const activeCells = [];
        rows.forEach((row, r) => {
            row.forEach((col, c) => {
                if (col === 1) {
                    const cell = {
                        x: c * cellWidth,
                        y: (r * cellHeight)-yOffSet
                    };
                    activeCells.push(cell);
                }
            });
        });

        context.strokeStyle = '#FFF';
        context.fillStyle = '#FFF';
        activeCells.forEach(cell => context.fillRect(cell.x, cell.y, cellWidth, cellHeight));
    }

    function _leftPad(padChar, str, length) {
        const charsNeeded = length - str.length;
        if (charsNeeded <= 0) return str;
        let pad = '';
        for (let i=0; i<charsNeeded; i++) {
            pad += padChar;
        }
        return pad + str;
    }

    function convertRowToHex(row) {
        const numberOfBytes = Math.ceil(row.length/8);
        const rowString = _leftPad('0', row.join(''), 8*numberOfBytes); // pad to make up to whole byte
        const binaryStrings = [];
        for (let i=0; i<rowString.length; i+=8) {
            binaryStrings.push(rowString.substring(i, i+8));
        }
        let hexStrings = binaryStrings.map(bin => _leftPad('0', parseInt(bin, 2).toString(16), 2));
        return hexStrings.join('');
    }

    function convertHexToRow(hex, rowSize) {
        const hexStrings = [];
        for (let i=0; i<hex.length ; i+=2) {
            const hexString = hex.substring(i,i+2);
            hexStrings.push(hexString);
        }
        const binaryStrings = hexStrings.map(hex => _leftPad('0', parseInt(hex, 16).toString(2), 8));
        const binary = binaryStrings.join('');
        return binary.substring(binary.length-rowSize, binary.length).split('');
    }

    function isValidInitialValue(numberOfColumns, hexValue) {
        if (!hexValue) return false;

        const numberOfHexDigits = Math.ceil(numberOfColumns/8)*2;
        if (hexValue.length != numberOfHexDigits)
            return false;

        const reg = /^[a-f0-9]+$/;
        return reg.test(hexValue);
    }

    function getRowFromQueryStringOrDefault(qsHexValue, numberOfColumns, generateRowFunc) {
        if (qsHexValue != null && isValidInitialValue(numberOfColumns, qsHexValue))
        {
            return convertHexToRow(qsHexValue, numberOfColumns);
        }
        return generateRowFunc(numberOfColumns);
    }

    return { generateRow, applyRules, advanceRow, draw, convertRowToHex, convertHexToRow, isValidInitialValue, getRowFromQueryStringOrDefault };
})();
