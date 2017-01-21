
function main() {
    class Localistation {

        constructor() {

            this._translations = [
                {
                    lang: 'en',
                    languageName: 'English',
                    texts: [
                        {selector: '#btnPlay img', attribute: 'alt', value: 'Play'},
                        {selector: '#btnPlay img', attribute: 'title', value: 'Play'},
                        {selector: '#btnPause img', attribute: 'alt', value: 'Pause'},
                        {selector: '#btnPause img', attribute: 'title', value: 'Pause'},
                        {selector: '#btnRandom img', attribute: 'alt', value: 'Random'},
                        {selector: '#btnRandom img', attribute: 'title', value: 'Refresh with a random automaton'},
                        {selector: '#btnSave img', attribute: 'alt', value: 'Save'},
                        {selector: '#btnSave img', attribute: 'title', value: 'Save the image'},
                        {selector: '#btnFullScreen img', attribute: 'alt', value: 'Full screen'},
                        {selector: '#btnFullScreen img', attribute: 'title', value: 'Display in full screen'},
                        {selector: '#btnExitFullScreen img', attribute: 'alt', value: 'Exit full screen'},
                        {selector: '#btnExitFullScreen img', attribute: 'title', value: 'Exit from full screen'}
                    ]
                },
                {
                    lang: 'cy',
                    languageName: 'Cymraeg',
                    texts: [
                        {selector: '#btnPlay img', attribute: 'alt', value: 'Chwarae'},
                        {selector: '#btnPlay img', attribute: 'title', value: 'Chwarae'},
                        {selector: '#btnPause img', attribute: 'alt', value: 'Aros'},
                        {selector: '#btnPause img', attribute: 'title', value: 'Aros'},
                        {selector: '#btnRandom img', attribute: 'alt', value: 'Ar hap'},
                        {selector: '#btnRandom img', attribute: 'title', value: 'Cynhyrchu delwedd newydd gan ddefnyddio awtomaton ar hap' },
                        {selector: '#btnSave img', attribute: 'alt', value: 'Arbed'},
                        {selector: '#btnSave img', attribute: 'title', value: 'Arbed y ddelwedd'},
                        {selector: '#btnFullScreen img', attribute: 'alt', value: 'Sgrin llawn'},
                        {selector: '#btnFullScreen img', attribute: 'title', value: 'Dangos mewn sgrin llawn'},
                        {selector: '#btnExitFullScreen img', attribute: 'alt', value: 'Gadael sgrin llawn'},
                        {selector: '#btnExitFullScreen img', attribute: 'title', value: 'Gadael sgrin llawn'}
                    ]
                }
            ];

            this._validLanguages = this._translations.map(x => x.lang);
        }

        getValidLanguages() {
            return this._validLanguages;
        }

        getDefaultLanguage() {
            return this._validLanguages[0];
        }

        isValidLanguage(languageCode) {
            if (typeof languageCode === 'undefined') return false;
            return this._validLanguages.indexOf(languageCode) !== -1;
        }

        getValidLanguageOrDefault(languageCode) {
            return this.isValidLanguage(languageCode) ? languageCode : this.getDefaultLanguage();
        }

        setLanguage(languageCode) {
            const translation = this._translations.find(x => x.lang === languageCode) || this._translations[0];

            translation.texts.forEach(t => {
                $(t.selector).attr(t.attribute, t.value);
            });

            // Set alternate languages
            $('link[rel="alternate"]').remove();
            const url = document.location.toString();
            const reg = /([&?]lang=)[a-zA-Z\-]+/;
            this._translations.filter(t => t.lang !== languageCode).map(t => t.lang).forEach(lang => {
                const langUrl = url.replace(reg, `$1${lang}`);
                $('head').append(`<link rel="alternate" hreflang="${lang}" href="${langUrl}" />`);
            });

            // Set lang in html tag
            $('html').attr('lang', languageCode);
        }

        setLanguageLinks() {
            const $ul = $('ul.languageChoices');
            $ul.empty();
            this._translations.forEach(t => {
                $ul.append($(`<li><a class="languageChoice" href="#" data-lang="${t.lang}">${t.languageName}</a></li>`));
            });
        }
    }

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
            this._running = false;
            this._firstTime = true;
            this._yOffset = 0;
            this._rows = [];

            this.resize();

            const that = this;
            $(document).on('mousemove', function() {
                that._menu = that._menu.activate();
            });

            this.tick();
        }

        getInitialRuleId() {
            return this._initialRuleId;
        }

        getInitialHexValue() {
            return this._initialHexValue;
        }

        getCurrentHexValue() {
            return (this._rows.length === 0) ? this._initialHexValue : cellular.convertRowToHex(this._rows[0]);
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

            const hexVal = (this._rows.length === 0) ? this._initialHexValue : cellular.convertRowToHex(this._rows[0]);
            this._rows = cellular.getInitialisedRows(this._initialRuleId, hexVal, this._numberOfColumns, this._numberOfRows);
            this.draw();
        }

        draw() {
            cellular.draw(this._context, this._rows, this._cellSize, this._cellSize, Math.floor(this._yOffset), this._backgroundColour, this._cellColour);
        }

        setToRandom() {
            this._running = false;
            this._lastTime = undefined;
            const rules = cellular.getRules();
            this._initialRuleId = rules[Math.floor(Math.random() * rules.length)].id;
            const row = cellular.generateRandomRow(this._numberOfColumns);
            this._initialHexValue = cellular.convertRowToHex(row);
            this._rows = cellular.getInitialisedRows(this._initialRuleId, this._initialHexValue, this._numberOfColumns, this._numberOfRows);
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

        saveImage() {
            const dataURL = this._context.canvas.toDataURL();
            const ruleId = this.getInitialRuleId();
            const currentValue = this.getCurrentHexValue();
            const fileName = `CellularAutomata_${ruleId}_${currentValue}.png`;
            return { dataURL, fileName }
        }
    }

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const numberOfColumns = 100;
    const localisation = new Localistation();

    const params = new URLSearchParams(location.search.slice(1));
    const qsInitialValue = params.get('initialValue');
    const qsRule = params.get('rule');
    let lang = localisation.getValidLanguageOrDefault(params.get('lang'));
    const initialRow = cellular.getRowFromQueryStringOrDefault(qsInitialValue, numberOfColumns, (n) => cellular.generateRandomRow(n));
    const hex = cellular.convertRowToHex(initialRow);
    const $initialValue = $('#initialValue');
    $initialValue.val(hex);
    $initialValue.change(function() {
        const value = $(this).val();
        const isEnabled = cellular.isValidInitialValue(numberOfColumns, value);
        $('#goButton').prop('disabled', !isEnabled);
    });
    const $rule = $('#rule');
    const rules = cellular.getRules();
    const ruleId = cellular.getRuleIdFromQueryStringOrDefault(qsRule, (rules) => rules[0].id);
    $.each(rules, function(index, rule) {
        const obj = { value: rule.id, text: rule.id };
        if (rule.id === ruleId) obj.selected = 'selected';
        $rule.append($('<option />', obj));
    });

    const menu = new Menu($('#menu'));
    const app = new CellularApp(window, context, numberOfColumns, ruleId, hex, menu);
    localisation.setLanguage(lang);
    localisation.setLanguageLinks();
    window.history.pushState({}, document.title, `?lang=${lang}&rule=${app.getInitialRuleId()}&initialValue=${app.getCurrentHexValue()}`);

    const updateButtonStatus = () => {
        window.history.replaceState({}, document.title, `?lang=${lang}&rule=${app.getInitialRuleId()}&initialValue=${app.getCurrentHexValue()}`);
        const playButton = $('#btnPlay');
        const pauseButton = $('#btnPause');
        const showButton = app.isRunning() ? pauseButton : playButton;
        const hideButton = app.isRunning() ? playButton : pauseButton;
        showButton.show();
        hideButton.hide();
    };

    $('#btnPlay').on('click', function (evt) {
        app.start();
        updateButtonStatus(); // TODO: use events?
        evt.preventDefault();
    });
    $('#btnPause').on('click', function (evt) {
        app.stop();
        updateButtonStatus();
        evt.preventDefault();
    });
    $('#btnRandom').on('click', function (evt) {
        app.setToRandom();
        $initialValue.val(app.getInitialHexValue());
        $rule.val(app.getInitialRuleId());
        updateButtonStatus();
        evt.preventDefault();
    });
    $('#btnSave').on('click', function (evt) {
        const saveButton = document.getElementById('btnSave');
        const saveInfo = app.saveImage();
        saveButton.href = saveInfo.dataURL;
        saveButton.download = saveInfo.fileName;
    });
    $('.languageChoice').on('click', function (evt) {
        const langWanted = $(this).data('lang');
        lang = localisation.getValidLanguageOrDefault(langWanted);
        localisation.setLanguage(lang);
        updateButtonStatus();
        evt.preventDefault();
    });

    // Full screen
    const $fullScreenButtons = $('#btnFullScreen, #btnExitFullScreen');
    if (!fullscreen.isSupported()) {
        $fullScreenButtons.hide();
        console.log('fullscreen not supported');
    } else {
        $fullScreenButtons.on('click', function (evt) {
            if (!fullscreen.isActive()) {
                const body = document.getElementById('body');
                fullscreen.request(body);
            } else {
                fullscreen.exit();
            }
            evt.preventDefault();
        });
        const handleFullScreenChange = () => {
            const isFullscreenActive = fullscreen.isActive();
            const enterFullscreenButton = $('#btnFullScreen');
            const exitFullscreenButton = $('#btnExitFullScreen');
            const showButton = isFullscreenActive ? exitFullscreenButton : enterFullscreenButton;
            const hideButton = isFullscreenActive ? enterFullscreenButton : exitFullscreenButton;
            showButton.show();
            hideButton.hide();
        };
        fullscreen.addEventListener(handleFullScreenChange);
    }

    // Window resizing
    window.addEventListener('resize', () => {
        app.resize();
    });

}

$(document).ready(function() {
    main();
});
