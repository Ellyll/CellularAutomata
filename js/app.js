
function main() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const numberOfColumns = 100; // 11
    const cellSize = Math.floor(window.innerWidth / numberOfColumns);
    const numberOfRows = Math.floor(window.innerHeight / cellSize);  //100; // 6
    canvas.width = cellSize * numberOfColumns;
    canvas.height = cellSize * numberOfRows;

    const params = new URLSearchParams(location.search.slice(1));
    const qsInitialValue = params.get('initialValue');
    const initialRow = cellular.getRowFromQueryStringOrDefault(qsInitialValue, numberOfColumns, (n) => cellular.generateRow(n));
    const hex = cellular.convertRowToHex(initialRow);
    const $initialValue = $('#initialValue');
    $initialValue.val(hex);
    $initialValue.change(function() {
        const value = $(this).val();
        const isEnabled = cellular.isValidInitialValue(numberOfColumns, value);
        //console.log(new Date(), `goButton enabled=${isEnabled} value=${value}`);
        $('#goButton').prop('disabled', !isEnabled);
    });

    class Menu {
        constructor($menuElement, isActive = false, lastTime = performance.now()) {
            this._$menuElement = $menuElement;
            this._isActive = isActive;
            this._lastTime = lastTime;
        }

        activate(currentTime = performance.now()) {
            if (!this._isActive) {
                this._$menuElement.fadeIn();
            }
            return new Menu(this._$menuElement, true, currentTime);
        }

        deactivate(currentTime = performance.now()) {
            if (this._isActive) {
                this._$menuElement.fadeOut();
            }
            return new Menu(this._$menuElement, false, currentTime);
        }

        tick(currentTime = performance.now()) {
            if (currentTime - this._lastTime > 5000) {
                return this.deactivate(currentTime)
            }
            return new Menu(this._$menuElement, true, currentTime);
        }
    }

    let isMenuActive = false;
    let lastMoveTime = performance.now();
    $(document).mousemove(function() {
        //console.log('moved', isMenuActive);
        const currentTime = performance.now();
        const elapsedTime = currentTime - lastMoveTime;
        if (!isMenuActive) {
            //console.log('activating menu');
            $('.menu').fadeIn();
            isMenuActive = true;
        }
        lastMoveTime = currentTime;
    });


    const rows = [];
    for (let r = 0; r < numberOfRows; r++) {
        let row;
        if (r === 0) {
            row = initialRow;
        } else {
            row = cellular.advanceRow(rows[r - 1]);
        }
        rows.push(row);
    }



    let timeStep = 100; // speed = 1 cell / second
    let lastTime = null;

    let counter = 0;
    let mainLoop = (currentTime, deltaTime) => {
        counter++;
        if (isMenuActive && (currentTime - lastMoveTime)>2000) {
            console.log('deactivating menu');
            $('.menu').fadeOut();
            isMenuActive = false;
        }
        if (lastTime === null) {
            rows.push(cellular.advanceRow(rows[rows.length-1]));
            lastTime = currentTime;
        }
        let timeDiff = deltaTime + (currentTime - lastTime);
        while (timeDiff >= timeStep) {
            timeDiff -= timeStep;
            rows.shift();
            rows.push(cellular.advanceRow(rows[rows.length-1]));
        }
        let yOffSet = Math.floor(timeDiff*(cellSize/timeStep));
        cellular.draw(context, rows, cellSize, cellSize, yOffSet);

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
