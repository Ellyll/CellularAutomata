requirejs(['app/cellular', 'app/localisation', 'app/menu', 'app/fullscreen', 'app/cellularApp'], function(cellular, Localisation, Menu, fullscreen, CellularApp) {

    function main() {

        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const numberOfColumns = 100;
        const localisation = new Localisation();

        const params = new URLSearchParams(location.search.slice(1));
        const qsInitialValue = params.get('initialValue');
        const qsRule = params.get('rule');
        const play = params.get('play') === 'true';
        let currentLanguageCode = localisation.getValidLanguageOrDefault(params.get('lang'));
        const initialRow = cellular.getRowFromQueryStringOrDefault(qsInitialValue, numberOfColumns, (n) => cellular.generateRandomRow(n));
        const hex = cellular.convertRowToHex(initialRow);
        const $initialValue = $('#initialValue');
        $initialValue.val(hex);
        $initialValue.change(function() {
            const value = $(this).val();
            const isEnabled = cellular.isValidInitialValue(numberOfColumns, value);
            $('#btnGo').prop('disabled', !isEnabled);
        });
        const $rule = $('#rule');
        const ruleId = cellular.getRuleIdFromQueryStringOrDefault(qsRule, (rules) => cellular.getRandomRule().id);
        $rule.val(ruleId);


        const menu = new Menu($('#menu'));
        const app = new CellularApp(window, context, numberOfColumns, ruleId, hex, menu, cellular);
        localisation.setLanguage(currentLanguageCode);
        localisation.setLanguageLinks();
        window.history.pushState({}, document.title, `?lang=${currentLanguageCode}&rule=${app.getInitialRuleId()}&initialValue=${app.getCurrentHexValue()}`);

        const updateButtonStatus = () => {
            let url = `?lang=${currentLanguageCode}&rule=${app.getInitialRuleId()}&initialValue=${app.getCurrentHexValue()}`;
            if (app.isRunning())
                url += `&play=true`;
            window.history.replaceState({}, document.title, url);
            const playButton = $('#btnPlay');
            const pauseButton = $('#btnPause');
            const buttonToShow = app.isRunning() ? pauseButton : playButton;
            const buttonToHide = app.isRunning() ? playButton : pauseButton;
            buttonToShow.show();
            buttonToHide.hide();
        };

        if (play) {
            app.start();
            updateButtonStatus();
        }

        $(document).on('mousemove', function() {
            app.setMenu(app.getMenu().activate());
        });

        // Buttons and links
        $('#btnGo').on('click', function (evt) {
            const rule = parseInt($rule.val().trim());
            if (cellular.isValidRuleId(rule)) {
                app.setRule(rule);
                $initialValue.val(app.getInitialHexValue());
                $rule.val(app.getInitialRuleId());
                updateButtonStatus();
            } else {
                alert(localisation.getText(currentLanguageCode, 'INVALID_RULE'));
            }
            evt.preventDefault();
        });
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
        $('#btnAbout').on('click', function (evt) {
            $('#mainMenu').hide();
            $('#aboutMenu').show();
            evt.preventDefault();
        });
        $('.languageChoice').on('click', function (evt) {
            const langWanted = $(this).data('lang');
            currentLanguageCode = localisation.getValidLanguageOrDefault(langWanted);
            localisation.setLanguage(currentLanguageCode);
            updateButtonStatus();
            $('#languageMenu').hide();
            $('#mainMenu').show();
            evt.preventDefault();
        });
        $('#btnLanguage').on('click', function (evt) {
            $('#mainMenu').hide();
            $('#languageMenu').show();
            evt.preventDefault();
        });
        $('.btnBack').on('click', function (evt) {
            $(this).parent().hide();
            $('#mainMenu').show();
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
});

