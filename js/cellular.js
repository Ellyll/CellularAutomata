(function () {
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

    function main() {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        const numberOfColumns = 100; // 11
        const cellSize = Math.floor(window.innerWidth / numberOfColumns);
        const numberOfRows = Math.floor(window.innerHeight / cellSize);  //100; // 6
        canvas.width = cellSize * numberOfColumns;
        canvas.height = cellSize * numberOfRows;

        const rows = [];
        for (let r = 0; r < numberOfRows; r++) {
            let row;
            if (r === 0) {
                row = generateRow(numberOfColumns); //[0,0,0,0,0,1,0,0,0,0,0]
            } else {
                row = advanceRow(rows[r - 1]);
            }
            rows.push(row);
        }

        let timeStep = 100; // speed = 1 cell / second
        let lastTime = null;

        let counter = 0;
        let mainLoop = (currentTime, deltaTime) => {
            counter++;
            if (lastTime === null) {
                rows.push(advanceRow(rows[rows.length-1]));
                lastTime = currentTime;
            }
            let timeDiff = deltaTime + (currentTime - lastTime);
            while (timeDiff >= timeStep) {
                timeDiff -= timeStep;
                rows.shift();
                rows.push(advanceRow(rows[rows.length-1]));
            }
            let yOffSet = Math.floor(timeDiff*(cellSize/timeStep));
            draw(context, rows, cellSize, cellSize, yOffSet);
            lastTime = currentTime;
            if (counter < 1000) {
                window.requestAnimationFrame( (t) => mainLoop(t, timeDiff));
            } else {
                console.log('finished');
            }
        };
        mainLoop(null, 0);
    }

    $(document).ready(function() {
        main();
    });
})();
