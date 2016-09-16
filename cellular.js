(function() {
    // Rule 73: http://atlas.wolfram.com/01/01/73/
    const rules = [
	[ [1,1,1], 0 ],
	[ [1,1,0], 1 ],
	[ [1,0,1], 0 ],
	[ [1,0,0], 0 ],
	[ [0,1,1], 1 ],
	[ [0,1,0], 0 ],
	[ [0,0,1], 0 ],
	[ [0,0,0], 1 ]
    ];

    function generateRow(numberOfColumns) {
	const row = new Array(numberOfColumns);
	for (let i=0; i<numberOfColumns ; i++) {
	    row[i] = Math.round(Math.random());
	}
	return row;
    }

    function applyRules(previousRow, column) {
	const left = (column === 0) ? previousRow[previousRow.length-1] : previousRow[column-1];
	const above = previousRow[column];
	const right = (column >= previousRow.length-1) ? previousRow[0] : previousRow[column+1];

	const block = [ left, above, right ];

	// find the rule that matches block and get the new value
	return rules.find(rule => {
	    return rule[0].every( (c, i) => c == block[i] )
	})[1];
    }
    
    function advanceRow(previousRow) {
	const row = previousRow.map( (c,i) => {
	    return newCol = applyRules(previousRow, i);
	});
	return row;
    }

    function draw(context, rows, cw) {
	const cellWidth = cw; //context.canvas.width / rows[0].length;
	const cellHeight = cw; //context.canvas.height / rows.length;

	rows.forEach( (row, r) => {
	    row.forEach( (col, c) => {
		const colour = col === 0 ? '#000' : '#FFF';
		context.strokeWidth = 0;
		context.strokeStyle = colour;
		context.fillStyle = colour;
		context.fillRect(c*cellWidth, r*cellHeight, cellWidth, cellHeight);
		
	    });
	});
    }

    function maximiseCanvas(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
    }
    

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    //maximiseCanvas(canvas);

    const numberOfColumns = 100; // 11
    const cellWidth = Math.floor(window.innerWidth / numberOfColumns);
    const numberOfRows = Math.floor(window.innerHeight / cellWidth);  //100; // 6
    canvas.width = cellWidth * numberOfColumns;
    canvas.height = cellWidth * numberOfRows;
    
    const rows = [];
    const firstRow = [];
    for (let r=0 ; r<numberOfRows ; r++) {
	let row;
	if (r === 0) {
	    row = generateRow(numberOfColumns); //[0,0,0,0,0,1,0,0,0,0,0]
	} else {
	    row = advanceRow(rows[r-1]);
	}
	rows.push(row);
    }

    console.log('rows', rows.length, 'columns', rows[0].length);
    console.log('canvas.width', canvas.width, 'canvas.height', canvas.height);
    console.log('cellWidth', cellWidth);
    //rows.forEach( (row, r) => {
	//console.log(r, row.join(''));
    //});

    draw(context, rows, cellWidth);

    
})();
