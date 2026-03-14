// ===========================
// Come Rosquillas - Internationalization (i18n)
// ===========================
// Provides multi-language support with browser language detection,
// localStorage persistence, and runtime switching without reload.
// Must be loaded BEFORE all other game scripts.

'use strict';

const I18n = (() => {
    const SUPPORTED_LANGUAGES = {
        en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
        es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
        fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
        de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
        'pt-BR': { name: 'Portuguese (BR)', flag: '🇧🇷', nativeName: 'Português' }
    };

    const STORAGE_KEY = 'comerosquillas_language';

    // ==================== TRANSLATIONS ====================
    const translations = {
        en: {
            // Game title & branding
            'game.title': 'Come Rosquillas!',
            'game.subtitle': "Homer's Donut Quest through Springfield",
            'game.catchphrase': '"Mmm... donuts"',

            // Start screen
            'start.eat_donuts': 'Eat all the donuts',
            'start.grab_duff': 'Grab a Duff to chase the bad guys',
            'start.beware_ghosts': 'Beware of Sr. Burns, Bob Patiño, Nelson & Snake!',
            'start.controls_legend': 'P = Pause \u00a0 M = Mute music \u00a0 L = Leaderboard \u00a0 A = Achievements \u00a0 H = Share \u00a0 D = Daily',
            'start.press_enter': 'Press ENTER or SPACE to start',
            'start.high_scores': 'HIGH SCORES',
            'start.best_combo': 'Best Combo Ever: 🔥 {0}x',
            'start.lvl': 'Lvl {0}',

            // Game states
            'game.ready': '🍩 READY!',
            'game.paused': 'PAUSED',
            'game.pause_hint': 'Press P or SPACE to continue',
            'game.game_over': 'Game Over!',
            'game.game_over_rank': 'Game Over!\nHigh Score #{0}!',
            'game.score': 'Score: {0}',
            'game.level': 'Level {0}',
            'game.lives': 'Lives: {0}',
            'game.press_enter_retry': 'Press ENTER to try again',

            // High score entry
            'highscore.title': '☆ NEW HIGH SCORE! ☆',
            'highscore.enter_initials': 'Enter your initials:',
            'highscore.use_arrows': 'Use ↑↓ to change letter',
            'highscore.move_position': '←→ to move position',
            'highscore.confirm': 'ENTER to confirm',
            'highscore.best_combo': 'Best Combo: 🔥 {0}x',

            // HUD & canvas overlay
            'hud.combo': '{0}x COMBO!',
            'hud.endless': '∞ ENDLESS',
            'hud.boss_approaching': '⚠️ BOSS APPROACHING! ⚠️',
            'hud.ghost_house': '☢ Nuclear Plant',
            'hud.muted': '🔇 MUTED',
            'hud.music_on': '🔊 MUSIC ON',
            'hud.debug_on': '🔍 DEBUG ON',
            'hud.debug_off': '🔍 DEBUG OFF',

            // Level display
            'level.title': '{name} - Level {level}',
            'level.endless_title': '∞ ENDLESS - {name} {level}',
            'level.skip_cutscene': 'Press any key to skip',

            // Maze theme names
            'maze.springfield_streets': 'Springfield Streets',
            'maze.moes_tavern': "Moe's Tavern",
            'maze.kwik_e_mart': 'Kwik-E-Mart',
            'maze.springfield_elementary': 'Springfield Elementary',
            'maze.nuclear_plant': 'Nuclear Plant',
            'maze.simpsons_house': 'Simpsons House',

            // Ghost names
            'ghost.burns': 'Sr. Burns',
            'ghost.bob': 'Bob Patiño',
            'ghost.nelson': 'Nelson',
            'ghost.snake': 'Snake',

            // Homer quotes (these are iconic, kept mostly as-is)
            'quote.death.1': "D'OH!",
            'quote.death.2': "¡D'OH!",
            'quote.death.3': 'Why you little...!',
            'quote.death.4': 'Mmm... floor.',
            'quote.power.1': 'Mmm... Duff!',
            'quote.power.2': 'Woohoo!',
            'quote.power.3': '¡Cerveza!',
            'quote.power.4': 'In pizza we trust!',
            'quote.win.1': 'Woohoo!',
            'quote.win.2': '¡Ño ño ño!',
            'quote.win.3': 'Donuts... is there anything they can\'t do?',
            'quote.gameover.1': "To alcohol! The cause of, and solution to, all of life's problems.",
            'quote.gameover.2': 'Trying is the first step toward failure.',
            'quote.gameover.3': 'Kids, you tried your best and you failed miserably.',
            'quote.gameover.4': 'Mmm... game over.',

            // Settings
            'settings.title': '⚙️ Settings',
            'settings.close': 'Close settings',
            'settings.audio': '🔊 Audio',
            'settings.master_volume': 'Master Volume',
            'settings.music_volume': 'Music Volume',
            'settings.sfx_volume': 'SFX Volume',
            'settings.music_enabled': 'Music Enabled',
            'settings.music_key_hint': '(M key)',
            'settings.on': 'ON',
            'settings.off': 'OFF',
            'settings.difficulty': '🎮 Difficulty',
            'settings.easy': 'Easy',
            'settings.easy_desc': 'Slow ghosts, forgiving gameplay',
            'settings.normal': 'Normal',
            'settings.normal_desc': 'Balanced challenge',
            'settings.hard': 'Hard',
            'settings.hard_desc': 'Fast ghosts, intense gameplay',
            'settings.controls': '🎹 Controls',
            'settings.move_homer': 'Move Homer',
            'settings.pause_game': 'Pause Game',
            'settings.toggle_music': 'Toggle Music',
            'settings.start_game': 'Start Game',
            'settings.accessibility': '♿ Accessibility',
            'settings.colorblind_mode': 'Colorblind Mode',
            'settings.colorblind_none': 'None',
            'settings.colorblind_protanopia': 'Protanopia (Red-blind)',
            'settings.colorblind_deuteranopia': 'Deuteranopia (Green-blind)',
            'settings.colorblind_tritanopia': 'Tritanopia (Blue-blind)',
            'settings.high_contrast': 'High Contrast',
            'settings.reduce_motion': 'Reduce Motion',
            'settings.large_text': 'Large Text (120%)',
            'settings.event_subtitles': 'Event Subtitles',
            'settings.ghost_proximity': 'Ghost Proximity Warning',
            'settings.screen_reader': 'Screen Reader Announcements',
            'settings.tutorial_section': '📖 Tutorial',
            'settings.tutorial_learn': 'Learn the game basics',
            'settings.tutorial_show': 'Show Tutorial',
            'settings.camera_section': '📷 Camera Effects',
            'settings.camera_shake': 'Screen Shake & Zoom',
            'settings.camera_auto_note': 'Auto-disables on low-end devices (FPS < 45)',
            'settings.language': '🌐 Language',
            'settings.language_label': 'Language',

            // Tutorial
            'tutorial.step_counter': 'Step {0} of {1}',
            'tutorial.skip': 'Skip Tutorial (ESC)',
            'tutorial.skip_label': 'Skip Tutorial',
            'tutorial.next': 'Next →',
            'tutorial.lets_play': "Let's Play! 🎮",
            'tutorial.start_playing': 'Start Playing!',
            'tutorial.tap_continue': 'Tap anywhere to continue',
            'tutorial.step1_title': '🎮 Move Homer!',
            'tutorial.step1_desktop': 'Use Arrow Keys to navigate Homer through the maze.',
            'tutorial.step1_mobile': 'Swipe in any direction to guide Homer through the maze.',
            'tutorial.step1_hint': 'Collect all the donuts to complete each level!',
            'tutorial.step2_title': '🍩 Grab a Duff!',
            'tutorial.step2_instruction': 'Eat a Power Pellet (the big flashing dots) to power up!',
            'tutorial.step2_hint': 'Ghosts turn blue and run away — now YOU chase THEM!',
            'tutorial.step3_title': '👻 Eat the Ghosts!',
            'tutorial.step3_instruction': 'While powered up, run into blue ghosts to eat them for bonus points!',
            'tutorial.step3_hint': 'Chain ghost eats for a combo multiplier: 200 → 400 → 800 → 1600!',
            'tutorial.celebration_title': "🎉 You're Ready!",
            'tutorial.celebration_msg': 'Go get those donuts, Homer!',
            'tutorial.celebration_quote': '"Mmm... donuts" — Homer Simpson',
            'tutorial.celebration_btn': 'Start Playing! 🍩',
            'tutorial.power_pellet': 'Power Pellet!',

            // Achievements
            'achievements.toast_title': 'Achievement Unlocked!',
            'achievements.progress': 'Achievements Unlocked ({0}%)',
            'achievements.unlocked_date': 'Unlocked {0}',

            // Stats dashboard
            'stats.leaderboard': '🏆 Leaderboard',
            'stats.stats': '📊 Stats',
            'stats.achievements_tab': '🏅 Achievements',
            'stats.close': 'Close dashboard',
            'stats.clear_data': '🗑️ Clear Data',
            'stats.done': 'Done',
            'stats.no_scores': 'No scores yet!',
            'stats.play_to_see': 'Play a game to see your scores here.',
            'stats.rank_header': '#',
            'stats.name_header': 'Name',
            'stats.score_header': 'Score',
            'stats.level_header': 'Lvl',
            'stats.combo_header': 'Combo',
            'stats.diff_header': 'Diff',
            'stats.date_header': 'Date',
            'stats.clear_confirm': 'Clear all {0}?',
            'stats.cancel': 'Cancel',
            'stats.yes_clear': 'Yes, Clear',
            'stats.play_to_unlock': 'Play to unlock achievements!',

            // Share menu
            'share.title': '📤 Share Your Score!',
            'share.close': 'Close',
            'share.share_btn': '📱 Share',
            'share.copy_link': '📋 Copy Link',
            'share.screenshot': '📸 Screenshot',
            'share.challenge': '⚔️ Challenge',
            'share.scan_to_play': 'Scan to play:',
            'share.game_title': "Come Rosquillas — Homer's Donut Quest",
            'share.score_msg': 'I scored {0} points on ComeRosquillas! Can you beat me?',
            'share.shared': 'Shared! 🎉',
            'share.copied': 'Copied to clipboard! 📋',
            'share.challenge_sent': 'Challenge sent! ⚔️',
            'share.challenge_copied': 'Challenge link copied! ⚔️',
            'share.screenshot_saved': 'Screenshot saved! 📸',
            'share.challenge_text': '🎮 I challenge you to beat my {0} points on ComeRosquillas!',

            // Daily challenge
            'daily.yesterday': "📊 Yesterday's Results",
            'daily.no_yesterday': 'No results from yesterday',
            'daily.today_leaderboard': "🏅 Today's Leaderboard",
            'daily.be_first': 'Be the first to play!',
            'daily.next_challenge': 'Next challenge in',
            'daily.play_again': '🔄 Play Again',
            'daily.play_today': "🎮 Play Today's Challenge",
        },

        es: {
            // Game title & branding
            'game.title': '¡Come Rosquillas!',
            'game.subtitle': 'La aventura de Homer por Springfield',
            'game.catchphrase': '"Mmm... rosquillas"',

            // Start screen
            'start.eat_donuts': 'Come todas las rosquillas',
            'start.grab_duff': 'Agarra una Duff para perseguir a los malos',
            'start.beware_ghosts': '¡Cuidado con Sr. Burns, Bob Patiño, Nelson y Snake!',
            'start.controls_legend': 'P = Pausa \u00a0 M = Silenciar música \u00a0 L = Tabla de puntos \u00a0 A = Logros \u00a0 H = Compartir \u00a0 D = Diario',
            'start.press_enter': 'Pulsa ENTER o ESPACIO para empezar',
            'start.high_scores': 'PUNTUACIONES',
            'start.best_combo': 'Mejor Combo: 🔥 {0}x',
            'start.lvl': 'Niv {0}',

            // Game states
            'game.ready': '🍩 ¡LISTO!',
            'game.paused': 'PAUSA',
            'game.pause_hint': 'Pulsa P o ESPACIO para continuar',
            'game.game_over': '¡Fin del juego!',
            'game.game_over_rank': '¡Fin del juego!\n¡Puntuación #{0}!',
            'game.score': 'Puntos: {0}',
            'game.level': 'Nivel {0}',
            'game.lives': 'Vidas: {0}',
            'game.press_enter_retry': 'Pulsa ENTER para reintentar',

            // High score entry
            'highscore.title': '☆ ¡NUEVA PUNTUACIÓN! ☆',
            'highscore.enter_initials': 'Introduce tus iniciales:',
            'highscore.use_arrows': 'Usa ↑↓ para cambiar letra',
            'highscore.move_position': '←→ para mover posición',
            'highscore.confirm': 'ENTER para confirmar',
            'highscore.best_combo': 'Mejor Combo: 🔥 {0}x',

            // HUD & canvas overlay
            'hud.combo': '¡{0}x COMBO!',
            'hud.endless': '∞ INFINITO',
            'hud.boss_approaching': '⚠️ ¡JEFE ACERCÁNDOSE! ⚠️',
            'hud.ghost_house': '☢ Planta Nuclear',
            'hud.muted': '🔇 SILENCIADO',
            'hud.music_on': '🔊 MÚSICA ON',
            'hud.debug_on': '🔍 DEBUG ON',
            'hud.debug_off': '🔍 DEBUG OFF',

            // Level display
            'level.title': '{name} - Nivel {level}',
            'level.endless_title': '∞ INFINITO - {name} {level}',
            'level.skip_cutscene': 'Pulsa cualquier tecla para saltar',

            // Maze theme names
            'maze.springfield_streets': 'Calles de Springfield',
            'maze.moes_tavern': 'Taberna de Moe',
            'maze.kwik_e_mart': 'Badulaque',
            'maze.springfield_elementary': 'Escuela de Springfield',
            'maze.nuclear_plant': 'Planta Nuclear',
            'maze.simpsons_house': 'Casa de los Simpson',

            // Ghost names
            'ghost.burns': 'Sr. Burns',
            'ghost.bob': 'Bob Patiño',
            'ghost.nelson': 'Nelson',
            'ghost.snake': 'Snake',

            // Homer quotes
            'quote.death.1': "¡D'OH!",
            'quote.death.2': "¡D'OH!",
            'quote.death.3': '¡Pequeño demonio...!',
            'quote.death.4': 'Mmm... suelo.',
            'quote.power.1': '¡Mmm... Duff!',
            'quote.power.2': '¡Yupi!',
            'quote.power.3': '¡Cerveza!',
            'quote.power.4': '¡En la pizza confiamos!',
            'quote.win.1': '¡Yupi!',
            'quote.win.2': '¡Ño ño ño!',
            'quote.win.3': 'Rosquillas... ¿hay algo que no puedan hacer?',
            'quote.gameover.1': 'Al alcohol: la causa y solución de todos los problemas de la vida.',
            'quote.gameover.2': 'Intentarlo es el primer paso hacia el fracaso.',
            'quote.gameover.3': 'Hijos, lo intentasteis y fracasasteis estrepitosamente.',
            'quote.gameover.4': 'Mmm... fin del juego.',

            // Settings
            'settings.title': '⚙️ Ajustes',
            'settings.close': 'Cerrar ajustes',
            'settings.audio': '🔊 Audio',
            'settings.master_volume': 'Volumen General',
            'settings.music_volume': 'Volumen Música',
            'settings.sfx_volume': 'Volumen Efectos',
            'settings.music_enabled': 'Música Activada',
            'settings.music_key_hint': '(tecla M)',
            'settings.on': 'SÍ',
            'settings.off': 'NO',
            'settings.difficulty': '🎮 Dificultad',
            'settings.easy': 'Fácil',
            'settings.easy_desc': 'Fantasmas lentos, juego indulgente',
            'settings.normal': 'Normal',
            'settings.normal_desc': 'Desafío equilibrado',
            'settings.hard': 'Difícil',
            'settings.hard_desc': 'Fantasmas rápidos, juego intenso',
            'settings.controls': '🎹 Controles',
            'settings.move_homer': 'Mover a Homer',
            'settings.pause_game': 'Pausar Juego',
            'settings.toggle_music': 'Activar Música',
            'settings.start_game': 'Iniciar Juego',
            'settings.accessibility': '♿ Accesibilidad',
            'settings.colorblind_mode': 'Modo Daltónico',
            'settings.colorblind_none': 'Ninguno',
            'settings.colorblind_protanopia': 'Protanopía (ceguera al rojo)',
            'settings.colorblind_deuteranopia': 'Deuteranopía (ceguera al verde)',
            'settings.colorblind_tritanopia': 'Tritanopía (ceguera al azul)',
            'settings.high_contrast': 'Alto Contraste',
            'settings.reduce_motion': 'Reducir Movimiento',
            'settings.large_text': 'Texto Grande (120%)',
            'settings.event_subtitles': 'Subtítulos de Eventos',
            'settings.ghost_proximity': 'Aviso de Proximidad de Fantasma',
            'settings.screen_reader': 'Anuncios del Lector de Pantalla',
            'settings.tutorial_section': '📖 Tutorial',
            'settings.tutorial_learn': 'Aprende lo básico del juego',
            'settings.tutorial_show': 'Mostrar Tutorial',
            'settings.camera_section': '📷 Efectos de Cámara',
            'settings.camera_shake': 'Temblor y Zoom de Pantalla',
            'settings.camera_auto_note': 'Se desactiva automáticamente en dispositivos lentos (FPS < 45)',
            'settings.language': '🌐 Idioma',
            'settings.language_label': 'Idioma',

            // Tutorial
            'tutorial.step_counter': 'Paso {0} de {1}',
            'tutorial.skip': 'Saltar Tutorial (ESC)',
            'tutorial.skip_label': 'Saltar Tutorial',
            'tutorial.next': 'Siguiente →',
            'tutorial.lets_play': '¡A Jugar! 🎮',
            'tutorial.start_playing': '¡Empezar a Jugar!',
            'tutorial.tap_continue': 'Toca en cualquier lugar para continuar',
            'tutorial.step1_title': '🎮 ¡Mueve a Homer!',
            'tutorial.step1_desktop': 'Usa las flechas del teclado para guiar a Homer por el laberinto.',
            'tutorial.step1_mobile': 'Desliza en cualquier dirección para guiar a Homer por el laberinto.',
            'tutorial.step1_hint': '¡Recoge todas las rosquillas para completar cada nivel!',
            'tutorial.step2_title': '🍩 ¡Agarra una Duff!',
            'tutorial.step2_instruction': '¡Come una Pildora de Poder (los puntos grandes que parpadean) para potenciarte!',
            'tutorial.step2_hint': '¡Los fantasmas se vuelven azules y huyen — ahora TÚ los persigues!',
            'tutorial.step3_title': '👻 ¡Come a los Fantasmas!',
            'tutorial.step3_instruction': '¡Mientras estás potenciado, choca con los fantasmas azules para comerlos y ganar puntos extra!',
            'tutorial.step3_hint': '¡Encadena fantasmas comidos para multiplicar puntos: 200 → 400 → 800 → 1600!',
            'tutorial.celebration_title': '🎉 ¡Estás Listo!',
            'tutorial.celebration_msg': '¡Ve por esas rosquillas, Homer!',
            'tutorial.celebration_quote': '"Mmm... rosquillas" — Homer Simpson',
            'tutorial.celebration_btn': '¡A Jugar! 🍩',
            'tutorial.power_pellet': '¡Píldora de Poder!',

            // Achievements
            'achievements.toast_title': '¡Logro Desbloqueado!',
            'achievements.progress': 'Logros Desbloqueados ({0}%)',
            'achievements.unlocked_date': 'Desbloqueado {0}',

            // Stats dashboard
            'stats.leaderboard': '🏆 Tabla de Puntos',
            'stats.stats': '📊 Estadísticas',
            'stats.achievements_tab': '🏅 Logros',
            'stats.close': 'Cerrar panel',
            'stats.clear_data': '🗑️ Borrar Datos',
            'stats.done': 'Hecho',
            'stats.no_scores': '¡Sin puntuaciones!',
            'stats.play_to_see': 'Juega una partida para ver tus puntos aquí.',
            'stats.rank_header': '#',
            'stats.name_header': 'Nombre',
            'stats.score_header': 'Puntos',
            'stats.level_header': 'Niv',
            'stats.combo_header': 'Combo',
            'stats.diff_header': 'Dif',
            'stats.date_header': 'Fecha',
            'stats.clear_confirm': '¿Borrar todos los {0}?',
            'stats.cancel': 'Cancelar',
            'stats.yes_clear': 'Sí, Borrar',
            'stats.play_to_unlock': '¡Juega para desbloquear logros!',

            // Share menu
            'share.title': '📤 ¡Comparte tu Puntuación!',
            'share.close': 'Cerrar',
            'share.share_btn': '📱 Compartir',
            'share.copy_link': '📋 Copiar Enlace',
            'share.screenshot': '📸 Captura',
            'share.challenge': '⚔️ Desafío',
            'share.scan_to_play': 'Escanea para jugar:',
            'share.game_title': 'Come Rosquillas — La aventura de Homer',
            'share.score_msg': '¡He conseguido {0} puntos en ComeRosquillas! ¿Puedes superarme?',
            'share.shared': '¡Compartido! 🎉',
            'share.copied': '¡Copiado al portapapeles! 📋',
            'share.challenge_sent': '¡Desafío enviado! ⚔️',
            'share.challenge_copied': '¡Enlace del desafío copiado! ⚔️',
            'share.screenshot_saved': '¡Captura guardada! 📸',
            'share.challenge_text': '🎮 ¡Te reto a superar mis {0} puntos en ComeRosquillas!',

            // Daily challenge
            'daily.yesterday': '📊 Resultados de Ayer',
            'daily.no_yesterday': 'Sin resultados de ayer',
            'daily.today_leaderboard': '🏅 Tabla de Hoy',
            'daily.be_first': '¡Sé el primero en jugar!',
            'daily.next_challenge': 'Siguiente desafío en',
            'daily.play_again': '🔄 Jugar de Nuevo',
            'daily.play_today': '🎮 Jugar el Desafío de Hoy',
        },

        fr: {
            'game.title': 'Come Rosquillas !',
            'game.subtitle': "L'aventure de Homer à Springfield",
            'game.catchphrase': '"Mmm... donuts"',
            'start.eat_donuts': 'Mange tous les donuts',
            'start.grab_duff': 'Attrape une Duff pour chasser les méchants',
            'start.beware_ghosts': 'Attention à Sr. Burns, Bob Patiño, Nelson & Snake !',
            'start.controls_legend': 'P = Pause \u00a0 M = Couper la musique \u00a0 L = Classement \u00a0 A = Succès \u00a0 H = Partager \u00a0 D = Défi',
            'start.press_enter': 'Appuie sur ENTRÉE ou ESPACE pour commencer',
            'start.high_scores': 'MEILLEURS SCORES',
            'start.best_combo': 'Meilleur Combo : 🔥 {0}x',
            'start.lvl': 'Niv {0}',
            'game.ready': '🍩 PRÊT !',
            'game.paused': 'PAUSE',
            'game.pause_hint': 'Appuie sur P ou ESPACE pour continuer',
            'game.game_over': 'Fin de partie !',
            'game.game_over_rank': 'Fin de partie !\nScore #{0} !',
            'game.score': 'Score : {0}',
            'game.level': 'Niveau {0}',
            'game.lives': 'Vies : {0}',
            'game.press_enter_retry': 'Appuie sur ENTRÉE pour réessayer',
            'highscore.title': '☆ NOUVEAU RECORD ! ☆',
            'highscore.enter_initials': 'Entre tes initiales :',
            'highscore.use_arrows': 'Utilise ↑↓ pour changer la lettre',
            'highscore.move_position': '←→ pour changer la position',
            'highscore.confirm': 'ENTRÉE pour confirmer',
            'highscore.best_combo': 'Meilleur Combo : 🔥 {0}x',
            'hud.combo': '{0}x COMBO !',
            'hud.endless': '∞ INFINI',
            'hud.boss_approaching': '⚠️ BOSS EN APPROCHE ! ⚠️',
            'hud.ghost_house': '☢ Centrale Nucléaire',
            'hud.muted': '🔇 MUET',
            'hud.music_on': '🔊 MUSIQUE ON',
            'level.title': '{name} - Niveau {level}',
            'level.endless_title': '∞ INFINI - {name} {level}',
            'level.skip_cutscene': 'Appuie sur une touche pour passer',
            'maze.springfield_streets': 'Rues de Springfield',
            'maze.moes_tavern': 'Taverne de Moe',
            'maze.kwik_e_mart': 'Kwik-E-Mart',
            'maze.springfield_elementary': 'École de Springfield',
            'maze.nuclear_plant': 'Centrale Nucléaire',
            'maze.simpsons_house': 'Maison des Simpson',
            'settings.title': '⚙️ Paramètres',
            'settings.close': 'Fermer les paramètres',
            'settings.audio': '🔊 Audio',
            'settings.master_volume': 'Volume Principal',
            'settings.music_volume': 'Volume Musique',
            'settings.sfx_volume': 'Volume Effets',
            'settings.music_enabled': 'Musique Activée',
            'settings.music_key_hint': '(touche M)',
            'settings.on': 'OUI',
            'settings.off': 'NON',
            'settings.difficulty': '🎮 Difficulté',
            'settings.easy': 'Facile',
            'settings.easy_desc': 'Fantômes lents, jeu indulgent',
            'settings.normal': 'Normal',
            'settings.normal_desc': 'Défi équilibré',
            'settings.hard': 'Difficile',
            'settings.hard_desc': 'Fantômes rapides, jeu intense',
            'settings.controls': '🎹 Contrôles',
            'settings.move_homer': 'Déplacer Homer',
            'settings.pause_game': 'Mettre en Pause',
            'settings.toggle_music': 'Basculer la Musique',
            'settings.start_game': 'Commencer',
            'settings.accessibility': '♿ Accessibilité',
            'settings.colorblind_mode': 'Mode Daltonien',
            'settings.colorblind_none': 'Aucun',
            'settings.colorblind_protanopia': 'Protanopie (daltonisme rouge)',
            'settings.colorblind_deuteranopia': 'Deutéranopie (daltonisme vert)',
            'settings.colorblind_tritanopia': 'Tritanopie (daltonisme bleu)',
            'settings.high_contrast': 'Contraste Élevé',
            'settings.reduce_motion': 'Réduire les Mouvements',
            'settings.large_text': 'Grand Texte (120%)',
            'settings.event_subtitles': 'Sous-titres des Événements',
            'settings.ghost_proximity': 'Alerte de Proximité des Fantômes',
            'settings.screen_reader': 'Annonces du Lecteur d\'Écran',
            'settings.tutorial_section': '📖 Tutoriel',
            'settings.tutorial_learn': 'Apprends les bases du jeu',
            'settings.tutorial_show': 'Montrer le Tutoriel',
            'settings.camera_section': '📷 Effets de Caméra',
            'settings.camera_shake': 'Tremblement & Zoom',
            'settings.camera_auto_note': 'Se désactive automatiquement sur appareils lents (FPS < 45)',
            'settings.language': '🌐 Langue',
            'settings.language_label': 'Langue',
            'tutorial.step_counter': 'Étape {0} sur {1}',
            'tutorial.skip': 'Passer le Tutoriel (ESC)',
            'tutorial.skip_label': 'Passer le Tutoriel',
            'tutorial.next': 'Suivant →',
            'tutorial.lets_play': 'Jouer ! 🎮',
            'tutorial.start_playing': 'Commencer à Jouer !',
            'tutorial.tap_continue': 'Touche n\'importe où pour continuer',
            'tutorial.step1_title': '🎮 Déplace Homer !',
            'tutorial.step1_desktop': 'Utilise les flèches pour guider Homer dans le labyrinthe.',
            'tutorial.step1_mobile': 'Glisse dans n\'importe quelle direction pour guider Homer.',
            'tutorial.step1_hint': 'Collecte tous les donuts pour terminer chaque niveau !',
            'tutorial.step2_title': '🍩 Attrape une Duff !',
            'tutorial.step2_instruction': 'Mange une Super Pastille (les gros points qui clignotent) pour te renforcer !',
            'tutorial.step2_hint': 'Les fantômes deviennent bleus et fuient — maintenant c\'est TOI qui les chasses !',
            'tutorial.step3_title': '👻 Mange les Fantômes !',
            'tutorial.step3_instruction': 'Une fois renforcé, fonce dans les fantômes bleus pour les manger et gagner des bonus !',
            'tutorial.step3_hint': 'Enchaîne les fantômes pour un multiplicateur : 200 → 400 → 800 → 1600 !',
            'tutorial.celebration_title': '🎉 Tu es Prêt !',
            'tutorial.celebration_msg': 'Va chercher ces donuts, Homer !',
            'tutorial.celebration_quote': '"Mmm... donuts" — Homer Simpson',
            'tutorial.celebration_btn': 'Commencer à Jouer ! 🍩',
            'tutorial.power_pellet': 'Super Pastille !',
            'achievements.toast_title': 'Succès Débloqué !',
            'achievements.progress': 'Succès Débloqués ({0}%)',
            'achievements.unlocked_date': 'Débloqué {0}',
            'stats.leaderboard': '🏆 Classement',
            'stats.stats': '📊 Statistiques',
            'stats.achievements_tab': '🏅 Succès',
            'stats.close': 'Fermer le panneau',
            'stats.clear_data': '🗑️ Effacer les Données',
            'stats.done': 'Terminé',
            'stats.no_scores': 'Pas encore de scores !',
            'stats.play_to_see': 'Joue une partie pour voir tes scores ici.',
            'stats.clear_confirm': 'Effacer tous les {0} ?',
            'stats.cancel': 'Annuler',
            'stats.yes_clear': 'Oui, Effacer',
            'stats.play_to_unlock': 'Joue pour débloquer des succès !',
            'share.title': '📤 Partage ton Score !',
            'share.close': 'Fermer',
            'share.share_btn': '📱 Partager',
            'share.copy_link': '📋 Copier le Lien',
            'share.screenshot': '📸 Capture d\'Écran',
            'share.challenge': '⚔️ Défi',
            'share.scan_to_play': 'Scanne pour jouer :',
            'share.game_title': 'Come Rosquillas — L\'aventure de Homer',
            'share.score_msg': 'J\'ai marqué {0} points sur ComeRosquillas ! Tu peux me battre ?',
            'share.shared': 'Partagé ! 🎉',
            'share.copied': 'Copié dans le presse-papiers ! 📋',
            'share.challenge_sent': 'Défi envoyé ! ⚔️',
            'share.challenge_copied': 'Lien du défi copié ! ⚔️',
            'share.screenshot_saved': 'Capture sauvegardée ! 📸',
            'share.challenge_text': '🎮 Je te défie de battre mes {0} points sur ComeRosquillas !',
            'daily.yesterday': '📊 Résultats d\'Hier',
            'daily.no_yesterday': 'Pas de résultats d\'hier',
            'daily.today_leaderboard': '🏅 Classement du Jour',
            'daily.be_first': 'Sois le premier à jouer !',
            'daily.next_challenge': 'Prochain défi dans',
            'daily.play_again': '🔄 Rejouer',
            'daily.play_today': '🎮 Jouer au Défi du Jour',
        },

        de: {
            'game.title': 'Come Rosquillas!',
            'game.subtitle': 'Homers Donut-Abenteuer durch Springfield',
            'game.catchphrase': '"Mmm... Donuts"',
            'start.eat_donuts': 'Iss alle Donuts',
            'start.grab_duff': 'Schnapp dir ein Duff, um die Bösen zu jagen',
            'start.beware_ghosts': 'Hüte dich vor Sr. Burns, Bob Patiño, Nelson & Snake!',
            'start.controls_legend': 'P = Pause \u00a0 M = Musik stumm \u00a0 L = Bestenliste \u00a0 A = Erfolge \u00a0 H = Teilen \u00a0 D = Täglich',
            'start.press_enter': 'Drücke ENTER oder LEERTASTE zum Starten',
            'start.high_scores': 'BESTENLISTE',
            'start.best_combo': 'Bester Combo aller Zeiten: 🔥 {0}x',
            'start.lvl': 'Lvl {0}',
            'game.ready': '🍩 BEREIT!',
            'game.paused': 'PAUSE',
            'game.pause_hint': 'Drücke P oder LEERTASTE zum Fortfahren',
            'game.game_over': 'Spiel vorbei!',
            'game.game_over_rank': 'Spiel vorbei!\nHighscore #{0}!',
            'game.score': 'Punkte: {0}',
            'game.level': 'Level {0}',
            'game.lives': 'Leben: {0}',
            'game.press_enter_retry': 'Drücke ENTER für einen neuen Versuch',
            'highscore.title': '☆ NEUER HIGHSCORE! ☆',
            'highscore.enter_initials': 'Gib deine Initialen ein:',
            'highscore.use_arrows': '↑↓ zum Buchstaben ändern',
            'highscore.move_position': '←→ zum Verschieben',
            'highscore.confirm': 'ENTER zum Bestätigen',
            'highscore.best_combo': 'Bester Combo: 🔥 {0}x',
            'hud.combo': '{0}x COMBO!',
            'hud.endless': '∞ ENDLOS',
            'hud.boss_approaching': '⚠️ BOSS NÄHERT SICH! ⚠️',
            'hud.ghost_house': '☢ Kernkraftwerk',
            'hud.muted': '🔇 STUMM',
            'hud.music_on': '🔊 MUSIK AN',
            'level.title': '{name} - Level {level}',
            'level.endless_title': '∞ ENDLOS - {name} {level}',
            'level.skip_cutscene': 'Beliebige Taste zum Überspringen',
            'maze.springfield_streets': 'Straßen von Springfield',
            'maze.moes_tavern': 'Moes Taverne',
            'maze.kwik_e_mart': 'Kwik-E-Mart',
            'maze.springfield_elementary': 'Grundschule Springfield',
            'maze.nuclear_plant': 'Kernkraftwerk',
            'maze.simpsons_house': 'Simpsons Haus',
            'settings.title': '⚙️ Einstellungen',
            'settings.close': 'Einstellungen schließen',
            'settings.audio': '🔊 Audio',
            'settings.master_volume': 'Gesamtlautstärke',
            'settings.music_volume': 'Musiklautstärke',
            'settings.sfx_volume': 'Effektlautstärke',
            'settings.music_enabled': 'Musik Aktiviert',
            'settings.music_key_hint': '(M-Taste)',
            'settings.on': 'AN',
            'settings.off': 'AUS',
            'settings.difficulty': '🎮 Schwierigkeit',
            'settings.easy': 'Leicht',
            'settings.easy_desc': 'Langsame Geister, nachsichtiges Spiel',
            'settings.normal': 'Normal',
            'settings.normal_desc': 'Ausgewogene Herausforderung',
            'settings.hard': 'Schwer',
            'settings.hard_desc': 'Schnelle Geister, intensives Spiel',
            'settings.controls': '🎹 Steuerung',
            'settings.move_homer': 'Homer bewegen',
            'settings.pause_game': 'Spiel pausieren',
            'settings.toggle_music': 'Musik ein/aus',
            'settings.start_game': 'Spiel starten',
            'settings.accessibility': '♿ Barrierefreiheit',
            'settings.colorblind_mode': 'Farbenblind-Modus',
            'settings.colorblind_none': 'Keiner',
            'settings.colorblind_protanopia': 'Protanopie (Rotblind)',
            'settings.colorblind_deuteranopia': 'Deuteranopie (Grünblind)',
            'settings.colorblind_tritanopia': 'Tritanopie (Blaublind)',
            'settings.high_contrast': 'Hoher Kontrast',
            'settings.reduce_motion': 'Bewegung Reduzieren',
            'settings.large_text': 'Großer Text (120%)',
            'settings.event_subtitles': 'Ereignis-Untertitel',
            'settings.ghost_proximity': 'Geister-Nähe-Warnung',
            'settings.screen_reader': 'Screenreader-Ansagen',
            'settings.tutorial_section': '📖 Tutorial',
            'settings.tutorial_learn': 'Lerne die Spielgrundlagen',
            'settings.tutorial_show': 'Tutorial Anzeigen',
            'settings.camera_section': '📷 Kamera-Effekte',
            'settings.camera_shake': 'Bildschirmwackeln & Zoom',
            'settings.camera_auto_note': 'Deaktiviert sich automatisch auf langsamen Geräten (FPS < 45)',
            'settings.language': '🌐 Sprache',
            'settings.language_label': 'Sprache',
            'tutorial.step_counter': 'Schritt {0} von {1}',
            'tutorial.skip': 'Tutorial überspringen (ESC)',
            'tutorial.skip_label': 'Tutorial überspringen',
            'tutorial.next': 'Weiter →',
            'tutorial.lets_play': 'Los geht\'s! 🎮',
            'tutorial.start_playing': 'Spiel starten!',
            'tutorial.tap_continue': 'Tippe irgendwo zum Fortfahren',
            'tutorial.step1_title': '🎮 Bewege Homer!',
            'tutorial.step1_desktop': 'Benutze die Pfeiltasten, um Homer durch das Labyrinth zu steuern.',
            'tutorial.step1_mobile': 'Wische in eine Richtung, um Homer durch das Labyrinth zu führen.',
            'tutorial.step1_hint': 'Sammle alle Donuts, um jedes Level abzuschließen!',
            'tutorial.step2_title': '🍩 Schnapp dir ein Duff!',
            'tutorial.step2_instruction': 'Iss eine Power-Pille (die großen blinkenden Punkte), um stärker zu werden!',
            'tutorial.step2_hint': 'Geister werden blau und fliehen — jetzt jagst DU sie!',
            'tutorial.step3_title': '👻 Friss die Geister!',
            'tutorial.step3_instruction': 'Renne in blaue Geister, um sie zu fressen und Bonuspunkte zu bekommen!',
            'tutorial.step3_hint': 'Verkette Geister für einen Combo-Multiplikator: 200 → 400 → 800 → 1600!',
            'tutorial.celebration_title': '🎉 Du bist bereit!',
            'tutorial.celebration_msg': 'Hol dir die Donuts, Homer!',
            'tutorial.celebration_quote': '"Mmm... Donuts" — Homer Simpson',
            'tutorial.celebration_btn': 'Spiel starten! 🍩',
            'tutorial.power_pellet': 'Power-Pille!',
            'achievements.toast_title': 'Erfolg Freigeschaltet!',
            'achievements.progress': 'Erfolge Freigeschaltet ({0}%)',
            'achievements.unlocked_date': 'Freigeschaltet {0}',
            'stats.leaderboard': '🏆 Bestenliste',
            'stats.stats': '📊 Statistiken',
            'stats.achievements_tab': '🏅 Erfolge',
            'stats.close': 'Panel schließen',
            'stats.clear_data': '🗑️ Daten Löschen',
            'stats.done': 'Fertig',
            'stats.no_scores': 'Noch keine Punkte!',
            'stats.play_to_see': 'Spiele eine Runde, um deine Punkte hier zu sehen.',
            'stats.clear_confirm': 'Alle {0} löschen?',
            'stats.cancel': 'Abbrechen',
            'stats.yes_clear': 'Ja, Löschen',
            'stats.play_to_unlock': 'Spiele, um Erfolge freizuschalten!',
            'share.title': '📤 Teile deinen Score!',
            'share.close': 'Schließen',
            'share.share_btn': '📱 Teilen',
            'share.copy_link': '📋 Link Kopieren',
            'share.screenshot': '📸 Screenshot',
            'share.challenge': '⚔️ Herausforderung',
            'share.scan_to_play': 'Scanne zum Spielen:',
            'share.game_title': 'Come Rosquillas — Homers Donut-Abenteuer',
            'share.score_msg': 'Ich habe {0} Punkte bei ComeRosquillas erreicht! Kannst du mich schlagen?',
            'share.shared': 'Geteilt! 🎉',
            'share.copied': 'In die Zwischenablage kopiert! 📋',
            'share.challenge_sent': 'Herausforderung gesendet! ⚔️',
            'share.challenge_copied': 'Herausforderungslink kopiert! ⚔️',
            'share.screenshot_saved': 'Screenshot gespeichert! 📸',
            'share.challenge_text': '🎮 Ich fordere dich heraus, meine {0} Punkte bei ComeRosquillas zu schlagen!',
            'daily.yesterday': '📊 Ergebnisse von Gestern',
            'daily.no_yesterday': 'Keine Ergebnisse von gestern',
            'daily.today_leaderboard': '🏅 Heutige Bestenliste',
            'daily.be_first': 'Sei der Erste, der spielt!',
            'daily.next_challenge': 'Nächste Herausforderung in',
            'daily.play_again': '🔄 Nochmal Spielen',
            'daily.play_today': '🎮 Heutige Herausforderung',
        },

        'pt-BR': {
            'game.title': 'Come Rosquillas!',
            'game.subtitle': 'A aventura de Homer por Springfield',
            'game.catchphrase': '"Mmm... donuts"',
            'start.eat_donuts': 'Coma todos os donuts',
            'start.grab_duff': 'Pegue uma Duff para perseguir os vilões',
            'start.beware_ghosts': 'Cuidado com Sr. Burns, Bob Patiño, Nelson & Snake!',
            'start.controls_legend': 'P = Pausar \u00a0 M = Mutar música \u00a0 L = Placar \u00a0 A = Conquistas \u00a0 H = Compartilhar \u00a0 D = Diário',
            'start.press_enter': 'Pressione ENTER ou ESPAÇO para começar',
            'start.high_scores': 'MELHORES PONTUAÇÕES',
            'start.best_combo': 'Melhor Combo: 🔥 {0}x',
            'start.lvl': 'Nív {0}',
            'game.ready': '🍩 PRONTO!',
            'game.paused': 'PAUSA',
            'game.pause_hint': 'Pressione P ou ESPAÇO para continuar',
            'game.game_over': 'Fim de Jogo!',
            'game.game_over_rank': 'Fim de Jogo!\nPontuação #{0}!',
            'game.score': 'Pontos: {0}',
            'game.level': 'Nível {0}',
            'game.lives': 'Vidas: {0}',
            'game.press_enter_retry': 'Pressione ENTER para tentar novamente',
            'highscore.title': '☆ NOVA PONTUAÇÃO MÁXIMA! ☆',
            'highscore.enter_initials': 'Digite suas iniciais:',
            'highscore.use_arrows': 'Use ↑↓ para mudar a letra',
            'highscore.move_position': '←→ para mudar a posição',
            'highscore.confirm': 'ENTER para confirmar',
            'highscore.best_combo': 'Melhor Combo: 🔥 {0}x',
            'hud.combo': '{0}x COMBO!',
            'hud.endless': '∞ INFINITO',
            'hud.boss_approaching': '⚠️ CHEFE SE APROXIMANDO! ⚠️',
            'hud.ghost_house': '☢ Usina Nuclear',
            'hud.muted': '🔇 MUDO',
            'hud.music_on': '🔊 MÚSICA ON',
            'level.title': '{name} - Nível {level}',
            'level.endless_title': '∞ INFINITO - {name} {level}',
            'level.skip_cutscene': 'Pressione qualquer tecla para pular',
            'maze.springfield_streets': 'Ruas de Springfield',
            'maze.moes_tavern': 'Taverna do Moe',
            'maze.kwik_e_mart': 'Kwik-E-Mart',
            'maze.springfield_elementary': 'Escola de Springfield',
            'maze.nuclear_plant': 'Usina Nuclear',
            'maze.simpsons_house': 'Casa dos Simpsons',
            'settings.title': '⚙️ Configurações',
            'settings.close': 'Fechar configurações',
            'settings.audio': '🔊 Áudio',
            'settings.master_volume': 'Volume Geral',
            'settings.music_volume': 'Volume da Música',
            'settings.sfx_volume': 'Volume dos Efeitos',
            'settings.music_enabled': 'Música Ativada',
            'settings.music_key_hint': '(tecla M)',
            'settings.on': 'SIM',
            'settings.off': 'NÃO',
            'settings.difficulty': '🎮 Dificuldade',
            'settings.easy': 'Fácil',
            'settings.easy_desc': 'Fantasmas lentos, jogo indulgente',
            'settings.normal': 'Normal',
            'settings.normal_desc': 'Desafio equilibrado',
            'settings.hard': 'Difícil',
            'settings.hard_desc': 'Fantasmas rápidos, jogo intenso',
            'settings.controls': '🎹 Controles',
            'settings.move_homer': 'Mover Homer',
            'settings.pause_game': 'Pausar Jogo',
            'settings.toggle_music': 'Alternar Música',
            'settings.start_game': 'Iniciar Jogo',
            'settings.accessibility': '♿ Acessibilidade',
            'settings.colorblind_mode': 'Modo Daltônico',
            'settings.colorblind_none': 'Nenhum',
            'settings.colorblind_protanopia': 'Protanopia (cego p/ vermelho)',
            'settings.colorblind_deuteranopia': 'Deuteranopia (cego p/ verde)',
            'settings.colorblind_tritanopia': 'Tritanopia (cego p/ azul)',
            'settings.high_contrast': 'Alto Contraste',
            'settings.reduce_motion': 'Reduzir Movimento',
            'settings.large_text': 'Texto Grande (120%)',
            'settings.event_subtitles': 'Legendas de Eventos',
            'settings.ghost_proximity': 'Aviso de Proximidade de Fantasma',
            'settings.screen_reader': 'Anúncios do Leitor de Tela',
            'settings.tutorial_section': '📖 Tutorial',
            'settings.tutorial_learn': 'Aprenda o básico do jogo',
            'settings.tutorial_show': 'Mostrar Tutorial',
            'settings.camera_section': '📷 Efeitos de Câmera',
            'settings.camera_shake': 'Tremor e Zoom de Tela',
            'settings.camera_auto_note': 'Desativa automaticamente em dispositivos lentos (FPS < 45)',
            'settings.language': '🌐 Idioma',
            'settings.language_label': 'Idioma',
            'tutorial.step_counter': 'Passo {0} de {1}',
            'tutorial.skip': 'Pular Tutorial (ESC)',
            'tutorial.skip_label': 'Pular Tutorial',
            'tutorial.next': 'Próximo →',
            'tutorial.lets_play': 'Vamos Jogar! 🎮',
            'tutorial.start_playing': 'Começar a Jogar!',
            'tutorial.tap_continue': 'Toque em qualquer lugar para continuar',
            'tutorial.step1_title': '🎮 Mova o Homer!',
            'tutorial.step1_desktop': 'Use as setas do teclado para guiar Homer pelo labirinto.',
            'tutorial.step1_mobile': 'Deslize em qualquer direção para guiar Homer pelo labirinto.',
            'tutorial.step1_hint': 'Colete todos os donuts para completar cada nível!',
            'tutorial.step2_title': '🍩 Pegue uma Duff!',
            'tutorial.step2_instruction': 'Coma uma Pílula de Poder (os pontos grandes piscando) para se fortalecer!',
            'tutorial.step2_hint': 'Os fantasmas ficam azuis e fogem — agora VOCÊ os persegue!',
            'tutorial.step3_title': '👻 Coma os Fantasmas!',
            'tutorial.step3_instruction': 'Enquanto fortalecido, corra nos fantasmas azuis para comê-los e ganhar pontos extra!',
            'tutorial.step3_hint': 'Encadeie fantasmas para um multiplicador: 200 → 400 → 800 → 1600!',
            'tutorial.celebration_title': '🎉 Você está Pronto!',
            'tutorial.celebration_msg': 'Vai buscar esses donuts, Homer!',
            'tutorial.celebration_quote': '"Mmm... donuts" — Homer Simpson',
            'tutorial.celebration_btn': 'Começar a Jogar! 🍩',
            'tutorial.power_pellet': 'Pílula de Poder!',
            'achievements.toast_title': 'Conquista Desbloqueada!',
            'achievements.progress': 'Conquistas Desbloqueadas ({0}%)',
            'achievements.unlocked_date': 'Desbloqueado {0}',
            'stats.leaderboard': '🏆 Placar',
            'stats.stats': '📊 Estatísticas',
            'stats.achievements_tab': '🏅 Conquistas',
            'stats.close': 'Fechar painel',
            'stats.clear_data': '🗑️ Limpar Dados',
            'stats.done': 'Pronto',
            'stats.no_scores': 'Sem pontuações ainda!',
            'stats.play_to_see': 'Jogue uma partida para ver seus pontos aqui.',
            'stats.clear_confirm': 'Limpar todos os {0}?',
            'stats.cancel': 'Cancelar',
            'stats.yes_clear': 'Sim, Limpar',
            'stats.play_to_unlock': 'Jogue para desbloquear conquistas!',
            'share.title': '📤 Compartilhe sua Pontuação!',
            'share.close': 'Fechar',
            'share.share_btn': '📱 Compartilhar',
            'share.copy_link': '📋 Copiar Link',
            'share.screenshot': '📸 Captura de Tela',
            'share.challenge': '⚔️ Desafio',
            'share.scan_to_play': 'Escaneie para jogar:',
            'share.game_title': 'Come Rosquillas — A aventura de Homer',
            'share.score_msg': 'Fiz {0} pontos no ComeRosquillas! Consegue me superar?',
            'share.shared': 'Compartilhado! 🎉',
            'share.copied': 'Copiado para a área de transferência! 📋',
            'share.challenge_sent': 'Desafio enviado! ⚔️',
            'share.challenge_copied': 'Link do desafio copiado! ⚔️',
            'share.screenshot_saved': 'Captura de tela salva! 📸',
            'share.challenge_text': '🎮 Desafio você a superar meus {0} pontos no ComeRosquillas!',
            'daily.yesterday': '📊 Resultados de Ontem',
            'daily.no_yesterday': 'Sem resultados de ontem',
            'daily.today_leaderboard': '🏅 Placar de Hoje',
            'daily.be_first': 'Seja o primeiro a jogar!',
            'daily.next_challenge': 'Próximo desafio em',
            'daily.play_again': '🔄 Jogar Novamente',
            'daily.play_today': '🎮 Jogar o Desafio de Hoje',
        }
    };

    // ==================== MAZE NAME KEY MAPPING ====================
    const MAZE_NAME_KEYS = {
        'Springfield Streets': 'maze.springfield_streets',
        "Moe's Tavern": 'maze.moes_tavern',
        'Kwik-E-Mart': 'maze.kwik_e_mart',
        'Springfield Elementary': 'maze.springfield_elementary',
        'Nuclear Plant': 'maze.nuclear_plant',
        'Simpsons House': 'maze.simpsons_house'
    };

    // ==================== I18N ENGINE ====================
    let currentLang = 'en';
    const changeListeners = [];

    function detectLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && translations[saved]) return saved;

        const browserLang = navigator.language || navigator.userLanguage || 'en';
        if (translations[browserLang]) return browserLang;

        const shortLang = browserLang.split('-')[0];
        if (translations[shortLang]) return shortLang;

        // Check for pt-BR specifically
        if (browserLang.startsWith('pt')) return 'pt-BR';

        return 'en';
    }

    function init() {
        currentLang = detectLanguage();
        document.documentElement.lang = currentLang === 'pt-BR' ? 'pt' : currentLang;
    }

    function t(key, ...args) {
        let str = (translations[currentLang] && translations[currentLang][key])
            || translations.en[key]
            || key;

        // Replace {0}, {1}, etc. positional placeholders
        for (let i = 0; i < args.length; i++) {
            str = str.replace(`{${i}}`, args[i]);
        }
        return str;
    }

    function tNamed(key, params) {
        let str = (translations[currentLang] && translations[currentLang][key])
            || translations.en[key]
            || key;

        if (params) {
            for (const [k, v] of Object.entries(params)) {
                str = str.replaceAll(`{${k}}`, v);
            }
        }
        return str;
    }

    function getMazeName(originalName) {
        const key = MAZE_NAME_KEYS[originalName];
        return key ? t(key) : originalName;
    }

    function getDeathQuotes() {
        return [t('quote.death.1'), t('quote.death.2'), t('quote.death.3'), t('quote.death.4')];
    }

    function getPowerQuotes() {
        return [t('quote.power.1'), t('quote.power.2'), t('quote.power.3'), t('quote.power.4')];
    }

    function getWinQuotes() {
        return [t('quote.win.1'), t('quote.win.2'), t('quote.win.3')];
    }

    function getGameOverQuotes() {
        return [t('quote.gameover.1'), t('quote.gameover.2'), t('quote.gameover.3'), t('quote.gameover.4')];
    }

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang === 'pt-BR' ? 'pt' : lang;
        for (const fn of changeListeners) {
            try { fn(lang); } catch (e) { console.warn('i18n listener error:', e); }
        }
    }

    function getLanguage() {
        return currentLang;
    }

    function getSupportedLanguages() {
        return { ...SUPPORTED_LANGUAGES };
    }

    function onChange(fn) {
        changeListeners.push(fn);
    }

    // Auto-initialize on load
    init();

    return {
        t,
        tNamed,
        setLanguage,
        getLanguage,
        getSupportedLanguages,
        onChange,
        getMazeName,
        getDeathQuotes,
        getPowerQuotes,
        getWinQuotes,
        getGameOverQuotes,
        SUPPORTED_LANGUAGES
    };
})();

// Global shorthand for convenience
function t(key, ...args) {
    return I18n.t(key, ...args);
}
