define(function() {
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

    return Menu;
});
