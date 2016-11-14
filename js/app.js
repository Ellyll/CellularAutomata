
function main() {
    class Menu {
        constructor($menuElement, isActive = false, lastTime = performance.now()) {
            this._$menuElement = $menuElement;
            this._isActive = isActive;
            this._lastTime = lastTime;
        }

        activate(currentTime = performance.now()) {
            if (!this._isActive) {
                console.log('activating menu');
                this._$menuElement.fadeIn();
            }
            return new Menu(this._$menuElement, true, currentTime);
        }

        deactivate(currentTime = performance.now()) {
            console.log('dectivating menu');
            if (this._isActive) {
                this._$menuElement.fadeOut();
            }
            return new Menu(this._$menuElement, false, currentTime);
        }

        tick(currentTime = performance.now()) {
            if (currentTime - this._lastTime > 5000) {
                return this.deactivate(currentTime)
            }
            return this;
        }
    }

    class CellularApp {
        constructor(window, context, numberOfColumns, initialRuleId, initialHexValue, menu) {
            this._window = window;
            this._context = context;
            this._numberOfColumns = numberOfColumns;
            this._initialRuleId = initialRuleId;
            this._initialHexValue = initialHexValue;
            this._backgroundColour = '#000';
            this._cellColour = '#FFF';
            this._menu = menu;

            this.resize();
            this._rows = cellular.getInitialisedRows(this._initialRuleId, this._initialHexValue, this._numberOfColumns, this._numberOfRows);
            this._running = false;
            this._firstTime = true;
            this._yOffset = 0;
            this.draw();

            const that = this;
            $(document).on('mousemove', function() {
                that._menu = that._menu.activate();
            });

            this.tick();
        }

        resize() {
            this._cellSize = Math.floor(this._window.innerWidth / this._numberOfColumns);
            this._numberOfRows = Math.floor(this._window.innerHeight / this._cellSize);
            this._context.canvas.width = this._cellSize * this._numberOfColumns;
            this._context.canvas.height = this._cellSize * this._numberOfRows;
        }

        draw() {
            cellular.draw(this._context, this._rows, this._cellSize, this._cellSize, Math.floor(this._yOffset), this._backgroundColour, this._cellColour);
        }

        start() {
            if (this._running) return; // already started
            this._running = true;
            this._lastTime = undefined;
        }

        stop() {
            if (!this._running) return; //already stopped
            this._running = false;
        }

        tick(currentTime = performance.now()) {
            //console.log('app tick');
            if (this._running) {
                if (!this._lastTime) {
                    if (this._firstTime) {
                        this._rows.push(cellular.advanceRow(this._initialRuleId, this._rows[this._rows.length-1]));
                        this._firstTime = false;
                    }
                    this._lastTime = currentTime;
                }
                const deltaTime = currentTime - this._lastTime;
                const speed = (this._cellSize*8.0) / 1000.0; // 4 rows per 1000 milliseconds (i.e. per second)

                this._yOffset += speed * deltaTime; // add distance
                while (this._yOffset >= this._cellSize) {
                    this._yOffset -= this._cellSize;
                    this._rows.shift();
                    this._rows.push(cellular.advanceRow(this._initialRuleId, this._rows[this._rows.length-1]));
                }
                this.draw();
            }
            this._lastTime = currentTime;
            this._menu = this._menu.tick(currentTime);
            const that = this;
            window.requestAnimationFrame(t => that.tick(t));
        }
    }

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const numberOfColumns = 100; // 11

    const initialRuleId = 73;




    // const cellSize = Math.floor(window.innerWidth / numberOfColumns);
    // const numberOfRows = Math.floor(window.innerHeight / cellSize);  //100; // 6
    // canvas.width = cellSize * numberOfColumns;
    // canvas.height = cellSize * numberOfRows;

    const params = new URLSearchParams(location.search.slice(1));
    const qsInitialValue = params.get('initialValue');
    const initialRow = cellular.getRowFromQueryStringOrDefault(qsInitialValue, numberOfColumns, (n) => cellular.generateRandomRow(n));
    const hex = cellular.convertRowToHex(initialRow);
    const $initialValue = $('#initialValue');
    $initialValue.val(hex);
    $initialValue.change(function() {
        const value = $(this).val();
        const isEnabled = cellular.isValidInitialValue(numberOfColumns, value);
        //console.log(new Date(), `goButton enabled=${isEnabled} value=${value}`);
        $('#goButton').prop('disabled', !isEnabled);
    });

    const menu = new Menu($('#menu'));
    const app = new CellularApp(window, context, numberOfColumns, initialRuleId, hex, menu);

    $('#btnPlay').on('click', function (evt) { app.start(); evt.preventDefault(); });
    $('#btnPause').on('click', function (evt) { app.stop(); evt.preventDefault(); });
    // TODO: handler for random
    // $('#btnRandom').on('click', function (evt) {
    //     app.SetToRandom();
    //     $initialValue.val(app.getInitialHexValue());
    //     evt.preventDefault();
    // });

    // let isMenuActive = false;
    // let lastMoveTime = performance.now();
    // $(document).mousemove(function() {
    //     //console.log('moved', isMenuActive);
    //     const currentTime = performance.now();
    //     const elapsedTime = currentTime - lastMoveTime;
    //     if (!isMenuActive) {
    //         //console.log('activating menu');
    //         $('.menu').fadeIn();
    //         isMenuActive = true;
    //     }
    //     lastMoveTime = currentTime;
    // });


    // const rows = [];
    // for (let r = 0; r < numberOfRows; r++) {
    //     let row;
    //     if (r === 0) {
    //         row = initialRow;
    //     } else {
    //         row = cellular.advanceRow(rows[r - 1]);
    //     }
    //     rows.push(row);
    // }



    // let timeStep = 100; // speed = 1 cell / second
    // let lastTime = null;
    //
    // let counter = 0;
    // let mainLoop = (currentTime, deltaTime) => {
    //     counter++;
    //     if (isMenuActive && (currentTime - lastMoveTime)>2000) {
    //         console.log('deactivating menu');
    //         $('.menu').fadeOut();
    //         isMenuActive = false;
    //     }
    //     if (lastTime === null) {
    //         rows.push(cellular.advanceRow(rows[rows.length-1]));
    //         lastTime = currentTime;
    //     }
    //     let timeDiff = deltaTime + (currentTime - lastTime);
    //     while (timeDiff >= timeStep) {
    //         timeDiff -= timeStep;
    //         rows.shift();
    //         rows.push(cellular.advanceRow(rows[rows.length-1]));
    //     }
    //     let yOffSet = Math.floor(timeDiff*(cellSize/timeStep));
    //     cellular.draw(context, rows, cellSize, cellSize, yOffSet);
    //
    //     lastTime = currentTime;
    //     if (counter < 1000) {
    //         window.requestAnimationFrame( (t) => mainLoop(t, timeDiff));
    //     } else {
    //         console.log('finished');
    //     }
    // };
    // mainLoop(null, 0);



}

$(document).ready(function() {
    main();
});
