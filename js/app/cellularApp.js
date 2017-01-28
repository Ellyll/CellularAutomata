define(function() {

    class CellularApp {
        constructor(window, context, numberOfColumns, initialRuleId, initialHexValue, menu, cellular) {
            this._window = window;
            this._context = context;
            this._numberOfColumns = numberOfColumns;
            this._initialRuleId = initialRuleId;
            this._initialHexValue = initialHexValue;
            this._backgroundColour = '#000';
            this._cellColour = '#FFF';
            this._menu = menu;
            this._running = false;
            this._firstTime = true;
            this._yOffset = 0;
            this._rows = [];
            this._cellular = cellular;

            this.resize();
            this.tick();
        }

        getMenu() {
            return this._menu;
        }

        setMenu(menu) {
            this._menu = menu;
        }

        getInitialRuleId() {
            return this._initialRuleId;
        }

        getInitialHexValue() {
            return this._initialHexValue;
        }

        getCurrentHexValue() {
            return (this._rows.length === 0) ? this._initialHexValue : this._cellular.convertRowToHex(this._rows[0]);
        }

        isRunning() {
            return this._running;
        }

        resize() {
            const newCellSize = Math.floor(this._window.innerWidth / this._numberOfColumns);
            if (this._yOffset > 0) {
                const oldCellSize = this._cellSize || newCellSize;
                this._yOffset *= newCellSize/oldCellSize;
            }
            this._cellSize = newCellSize;
            this._numberOfRows = Math.floor(this._window.innerHeight / this._cellSize);
            this._context.canvas.width = this._cellSize * this._numberOfColumns;
            this._context.canvas.height = this._cellSize * this._numberOfRows;

            const hexVal = (this._rows.length === 0) ? this._initialHexValue : this._cellular.convertRowToHex(this._rows[0]);
            this._rows = this._cellular.getInitialisedRows(this._initialRuleId, hexVal, this._numberOfColumns, this._numberOfRows);
            this.draw();
        }

        draw() {
            this._cellular.draw(this._context, this._rows, this._cellSize, this._cellSize, Math.floor(this._yOffset), this._backgroundColour, this._cellColour);
        }

        setToRandom() {
            this._running = false;
            this._lastTime = undefined;
            const rules = this._cellular.getRules();
            this._initialRuleId = rules[Math.floor(Math.random() * rules.length)].id;
            const row = this._cellular.generateRandomRow(this._numberOfColumns);
            this._initialHexValue = this._cellular.convertRowToHex(row);
            this._rows = this._cellular.getInitialisedRows(this._initialRuleId, this._initialHexValue, this._numberOfColumns, this._numberOfRows);
            this._running = false;
            this._firstTime = true;
            this._yOffset = 0;
            this.draw();
        }

        setRule(ruleId) {
            this._running = false;
            this._lastTime = undefined;
            this._initialRuleId = ruleId;
            this._rows = this._cellular.getInitialisedRows(this._initialRuleId, this._initialHexValue, this._numberOfColumns, this._numberOfRows);
            this._running = false;
            this._firstTime = true;
            this._yOffset = 0;
            this.draw();
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
            if (this._running) {
                if (!this._lastTime) {
                    if (this._firstTime) {
                        this._rows.push(this._cellular.advanceRow(this._initialRuleId, this._rows[this._rows.length-1]));
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
                    this._rows.push(this._cellular.advanceRow(this._initialRuleId, this._rows[this._rows.length-1]));
                }
                this.draw();
            }
            this._lastTime = currentTime;
            this._menu = this._menu.tick(currentTime);
            const that = this;
            window.requestAnimationFrame(t => that.tick(t));
        }

        saveImage() {
            const dataURL = this._context.canvas.toDataURL();
            const ruleId = this.getInitialRuleId();
            const currentValue = this.getCurrentHexValue();
            const fileName = `CellularAutomata_${ruleId}_${currentValue}.png`;
            return { dataURL, fileName }
        }
    }

    return CellularApp;
});
