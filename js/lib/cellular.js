const cellular = (function() {

    const _rules = [
        {
            id: 72,
            type: '1d',
            uri: 'http://atlas.wolfram.com/01/01/72/',
            properties: [
                // [ left, middle, right ], new value
                [[1, 1, 1], 0],
                [[1, 1, 0], 1],
                [[1, 0, 1], 0],
                [[1, 0, 0], 0],
                [[0, 1, 1], 1],
                [[0, 1, 0], 0],
                [[0, 0, 1], 0],
                [[0, 0, 0], 0]
            ]
        },
        {
            id: 73,
            type: '1d',
            uri: 'http://atlas.wolfram.com/01/01/73/',
            properties: [
                // [ left, middle, right ], new value
                [[1, 1, 1], 0],
                [[1, 1, 0], 1],
                [[1, 0, 1], 0],
                [[1, 0, 0], 0],
                [[0, 1, 1], 1],
                [[0, 1, 0], 0],
                [[0, 0, 1], 0],
                [[0, 0, 0], 1]
            ]
        }
    ];

    function getRules() {
        return _rules;
    }

    function generateRandomRow(numberOfColumns) {
        const row = new Array(numberOfColumns);
        for (let i = 0; i < numberOfColumns; i++) {
            row[i] = Math.round(Math.random());
        }
        return row;
    }

    function applyRules(rule, previousRow, column) {
        const left = (column === 0) ? previousRow[previousRow.length - 1] : previousRow[column - 1];
        const middle = previousRow[column];
        const right = (column >= previousRow.length - 1) ? previousRow[0] : previousRow[column + 1];

        const block = [left, middle, right];

        // find the rule property that matches block and get the new value
        return rule.properties.find(property => {
            return property[0].every((c, i) => c == block[i])
        })[1];
    }

    function getRuleById(ruleId) {
        const rule = _rules.find(r => r.id === ruleId);
        if (typeof rule === 'undefined') {
            throw new Error(`rule not found with id: ${ruleId}`);
        }
        return rule;
    }

    function advanceRow(ruleId, previousRow) {
        const rule = getRuleById(ruleId);
        return previousRow.map((c, i) => {
            return applyRules(rule, previousRow, i);
        });
    }

    function draw(context, rows, cellWidth, cellHeight, yOffSet, backgroundColour = '#000', cellColour = '#FFF') {
        context.strokeWidth = 0;

        context.fillStyle = backgroundColour;
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

        context.strokeStyle = cellColour;
        context.fillStyle = cellColour;
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

    function isValidRuleId(ruleId) {
        if (!ruleId) return false;

        return ruleId === 73;
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

    function getRuleIdFromQueryStringOrDefault(qsRuleId, getRuleIdFunc) {
        if (qsRuleId != null && isValidRuleId(parseInt(qsRuleId))) {
            return parseInt(qsRuleId);
        }
        return getRuleIdFunc(_rules);
    }

    function getInitialisedRows(ruleId, initialHexValue, numberOfColumns, numberOfRows) {

        // Validate
        if (typeof numberOfColumns !== 'number') {
            throw new TypeError(`NumberOfColumns must be a number, but is of type ${typeof numberOfColumns}`);
        }
        if (numberOfColumns <= 0) {
            throw new RangeError('NumberOfColumns must be greater than zero');
        }
        if (typeof numberOfRows !== 'number') {
            throw new TypeError(`NumberOfRows must be a number, but is of type ${typeof numberOfRows}`);
        }
        if (numberOfRows <= 0) {
            throw new RangeError('NumberOfRows must be greater than zero');
        }
        if (!cellular.isValidRuleId(ruleId)) {
            throw new Error('Invalid rule id');
        }
        if (!cellular.isValidInitialValue(numberOfColumns, initialHexValue)) {
            throw new Error('Invalid initial hex value');
        }

        // Create rows
        const rows = [];
        for (let r = 0; r < numberOfRows; r++) {
            let row;
            if (r === 0) {
                // First row - created from initial hex value
                row = convertHexToRow(initialHexValue, numberOfColumns);
            } else {
                // Not first, so generate this row from the previous one
                row = advanceRow(ruleId, rows[r - 1]);
            }
            rows.push(row);
        }

        return rows;
    }

    return {
        generateRandomRow,
        applyRules,
        advanceRow,
        draw,
        convertRowToHex,
        convertHexToRow,
        getRules,
        isValidRuleId,
        isValidInitialValue,
        getRowFromQueryStringOrDefault,
        getRuleIdFromQueryStringOrDefault,
        getInitialisedRows
    };
})();
