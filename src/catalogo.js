// ─── CATÁLOGO CANÓNICO DE EJERCICIOS ─────────────────────────────────────────
// Cada ejercicio real tiene UN id único, UN GIF verificado (por el nombre en
// inglés del archivo) y UNA métrica de registro. Así:
//   · la imagen siempre corresponde al ejercicio
//   · cada ejercicio (incluidas alternativas y rotaciones) guarda su propio progreso
//
// métrica:
//   'kg_reps' → peso (kg) + repeticiones por serie
//   'reps'    → repeticiones + lastre opcional (kg) — peso corporal
//   'seg'     → segundos por serie (isométricos)
//
// familia: ejercicios intercambiables (mismo patrón de movimiento) usados para
// la rotación automática por bloques y para proponer alternativas.
// barra: true → alta carga axial/articular (se evita en perfiles 50+ o IMC ≥30)

const SB = 'https://dasnnugyotijeoiitrie.supabase.co/storage/v1/object/public/exercise-gifs/'
const g = f => `${SB}${f}${f.endsWith('.gif') ? '' : '_720.gif'}`

// [id, nombre, grupo, zona, métrica, familia, archivo GIF, barra?]
const RAW = [
  // ── PECHO ──
  ['pb',            'Press banca con barra',              'Pecho', 'medio',    'kg_reps', 'press_plano',   '00251301-Barbell-Bench-Press_Chest-FIX', true],
  ['pman',          'Press banca con mancuernas',         'Pecho', 'medio',    'kg_reps', 'press_plano',   '02891301-Dumbbell-Bench-Press_Chest'],
  ['press_maquina', 'Press de pecho en máquina',          'Pecho', 'medio',    'kg_reps', 'press_plano',   '13011301-Machine-Inner-Chest-Press_Chest'],
  ['pi',            'Press inclinado mancuernas',         'Pecho', 'alto',     'kg_reps', 'press_inclinado','03241301-Dumbbell-Incline-Palm-in-Press_Chest'],
  ['pi_barra',      'Press inclinado con barra',          'Pecho', 'alto',     'kg_reps', 'press_inclinado','00471301-Barbell-Incline-Bench-Press_Chest', true],
  ['pi_maquina',    'Press inclinado en máquina',         'Pecho', 'alto',     'kg_reps', 'press_inclinado','14791301-Lever-Incline-Chest-Press_Chest'],
  ['press_declinado','Press declinado mancuernas',        'Pecho', 'bajo',     'kg_reps', 'fondos',        '03011301-Dumbbell-Decline-Bench-Press_Chest'],
  ['fo',            'Fondos en paralelas',                'Pecho', 'bajo',     'reps',    'fondos',        '02511301-Chest-Dip_Chest'],
  ['fondos_maquina','Fondos en máquina',                  'Pecho', 'bajo',     'kg_reps', 'fondos',        '14511301-Lever-Seated-Dip_Upper-Arms'],
  ['flexiones',     'Flexiones',                          'Pecho', 'medio',    'reps',    'flexiones',            '06621301-Push-up-m_Chest-FIX'],
  ['ap',            'Cruce de poleas',                    'Pecho', 'interno',  'kg_reps', 'aperturas',     '02271301-Cable-Standing-Fly_Chest'],
  ['pec_deck',      'Aperturas en máquina (pec deck)',    'Pecho', 'interno',  'kg_reps', 'aperturas',     '10301301-Lever-Pec-Deck-Fly_Chest'],
  ['aperturas_manc','Aperturas con mancuernas',           'Pecho', 'interno',  'kg_reps', 'aperturas',     '03081301-Dumbbell-Fly_Chest-FIX'],
  ['aperturas_incl','Aperturas inclinadas mancuernas',    'Pecho', 'alto',     'kg_reps', 'aperturas',     '03191301-Dumbbell-Incline-Fly_Chest-FIX'],
  ['cruce_alto',    'Cruce de poleas a pecho alto',       'Pecho', 'alto',     'kg_reps', 'aperturas',     '12701301-Cable-Upper-Chest-Crossovers_Chest'],

  // ── ESPALDA ──
  ['jp',            'Jalón al pecho',                     'Espalda', 'dorsal',   'kg_reps', 'jalon',       '01971301-Cable-Pulldown-pro-lat-bar_Back'],
  ['jalon_supino',  'Jalón agarre supino',                'Espalda', 'dorsal',   'kg_reps', 'jalon',       '02451301-Cable-Underhand-Pulldown_Back'],
  ['jalon_maquina', 'Jalón en máquina',                   'Espalda', 'dorsal',   'kg_reps', 'jalon',       '05791301-Lever-Front-Pulldown_Back'],
  ['jalon_uni',     'Jalón unilateral en polea',          'Espalda', 'dorsal',   'kg_reps', 'jalon',       '12041301-Cable-one-arm-lat-pulldown_back'],
  ['je',            'Jalón agarre estrecho (triángulo)',  'Espalda', 'dorsal',   'kg_reps', 'jalon',       '26161301-Cable-Lateral-Pulldown-with-V-bar_Back'],
  ['dom',           'Dominadas',                          'Espalda', 'dorsal',   'reps',    'dominada',    '14291301-Wide-Grip-Pull-Up_Back'],
  ['chin',          'Dominadas supinas (chin-up)',        'Espalda', 'dorsal',   'reps',    'dominada',    '13261301-Chin-Up_Back'],
  ['dom_neutra',    'Dominadas agarre neutro',            'Espalda', 'dorsal',   'reps',    'dominada',    '18651301-Hammer-Grip-Pull-up-on-Dip-Cage_Back'],
  ['pullover_polea','Pullover en polea (brazos rectos)',  'Espalda', 'dorsal',   'kg_reps', 'pullover',    '02381301-Cable-Straight-Arm-Pulldown_Back'],
  ['rb',            'Remo con barra',                     'Espalda', 'romboides','kg_reps', 'remo_libre',  '00271301-Barbell-Bent-Over-Row_Back-FIX', true],
  ['pendlay',       'Remo Pendlay (barra)',               'Espalda', 'romboides','kg_reps', 'remo_libre',  '00271301-Barbell-Bent-Over-Row_Back-FIX', true],
  ['remo_supino',   'Remo con barra agarre supino',       'Espalda', 'romboides','kg_reps', 'remo_libre',  '01181301-Barbell-Reverse-Grip-Bent-over-Row_Back-FIX', true],
  ['remo_t',        'Remo en barra T con apoyo',          'Espalda', 'romboides','kg_reps', 'remo_libre',  '11941301-Lever-Lying-T-bar-Row_Back'],
  ['remo_incl',     'Remo en banco inclinado mancuernas', 'Espalda', 'romboides','kg_reps', 'remo_libre',  '03271301-Dumbbell-Incline-Row_Back'],
  ['rman',          'Remo mancuerna unilateral',          'Espalda', 'romboides','kg_reps', 'remo_uni',    '02921301-Dumbbell-Bent-over-Row_back_Back'],
  ['remo_uni_polea','Remo unilateral en polea baja',      'Espalda', 'romboides','kg_reps', 'remo_uni',    '01891301-Cable-One-Arm-Bent-over-Row_Back-FIX'],
  ['rs',            'Remo sentado en polea',              'Espalda', 'romboides','kg_reps', 'remo_polea',  '26611301-Cable-Seated-Row-with-V-bar_Back'],
  ['remo_maquina',  'Remo sentado en máquina',            'Espalda', 'romboides','kg_reps', 'remo_polea',  '13501301-Lever-Seated-Row_Back'],
  ['remo_abierto',  'Remo en polea agarre abierto',       'Espalda', 'romboides','kg_reps', 'remo_polea',  '02181301-Cable-Seated-Wide-grip-Row_Back'],
  ['hiper',         'Hiperextensiones lumbares',          'Espalda', 'lumbar',   'reps',    null,          '18601301-Hyperextension-VERSION-2_Hips'],
  ['entr',          'Encogimientos con mancuernas',       'Espalda', 'trapecio', 'kg_reps', 'encogimiento','04061301-Dumbbell-Shrug_Back-FIX'],
  ['encog_barra',   'Encogimientos con barra',            'Espalda', 'trapecio', 'kg_reps', 'encogimiento','00951301-Barbell-Shrug_Back'],
  ['encog_polea',   'Encogimientos en polea',             'Espalda', 'trapecio', 'kg_reps', 'encogimiento','02201301-Cable-Shrug_Back'],

  // ── HOMBROS ──
  ['pm',            'Press militar con barra de pie',     'Hombros', 'anterior', 'kg_reps', 'press_hombro','11651301-Barbell-Standing-Military-Press-without-rack_Shoulders', true],
  ['pm_manc',       'Press militar con mancuernas',       'Hombros', 'anterior', 'kg_reps', 'press_hombro','04261301-Dumbbell-Standing-Overhead-Press_shoulder'],
  ['pm_maquina',    'Press de hombros en máquina',        'Hombros', 'anterior', 'kg_reps', 'press_hombro','14541103-Lever-Seated-Shoulder-Press_Shoulders'],
  ['arnold',        'Press Arnold',                       'Hombros', 'anterior', 'kg_reps', 'press_hombro','21371301-Dumbbell-Arnold-Press_Shoulders'],
  ['ef',            'Elevaciones frontales mancuernas',   'Hombros', 'anterior', 'kg_reps', null,          '03101301-Dumbbell-Front-Raise_Shoulders'],
  ['el',            'Elevaciones laterales mancuernas',   'Hombros', 'lateral',  'kg_reps', 'lateral',     '03341301-Dumbbell-Lateral-Raise_shoulder-AFIX'],
  ['el_polea',      'Elevación lateral en polea',         'Hombros', 'lateral',  'kg_reps', 'lateral',     '01921301-Cable-One-Arm-Lateral-Raise_Shoulders'],
  ['el_maquina',    'Elevaciones laterales en máquina',   'Hombros', 'lateral',  'kg_reps', 'lateral',     '33431301-Lever-Lateral-Raise-VERSION-2_Shoulders'],
  ['remo_menton',   'Remo al mentón con mancuernas',      'Hombros', 'lateral',  'kg_reps', 'lateral',     '04371301-Dumbbell-Upright-Row_shoulder'],
  ['pp',            'Pájaros con mancuernas',             'Hombros', 'posterior','kg_reps', 'posterior',   '03781301-Dumbbell-Rear-Fly_Shoulders'],
  ['pp_maquina',    'Aperturas inversas en máquina',      'Hombros', 'posterior','kg_reps', 'posterior',   '06021301-Lever-Seated-Reverse-Fly_Shoulders'],
  ['pp_polea',      'Pájaro unilateral en polea',         'Hombros', 'posterior','kg_reps', 'posterior',   '39121301-Cable-Bent-Over-One-Arm-Lateral-Raise_Shoulders'],
  ['fp',            'Face pull con cuerda',               'Hombros', 'posterior','kg_reps', 'posterior',   '32321301-Cable-Standing-Rear-Delt-Horizontal-Row-with-rope_Shoulder'],

  // ── BÍCEPS ──
  ['cb',            'Curl con barra EZ',                  'Bíceps', 'cabeza_larga', 'kg_reps', 'curl',     '04471301-EZ-Barbell-Curl_Upper-Arms'],
  ['curl_barra',    'Curl con barra recta',               'Bíceps', 'cabeza_larga', 'kg_reps', 'curl',     '00311301-Barbell-Curl_Upper-Arms'],
  ['curl_manc',     'Curl alterno con mancuernas',        'Bíceps', 'cabeza_larga', 'kg_reps', 'curl',     '02851301-Dumbbell-Alternate-Biceps-Curl_Upper-Arms'],
  ['curl_incl',     'Curl inclinado con mancuernas',      'Bíceps', 'cabeza_larga', 'kg_reps', 'curl',     '03181301-Dumbbell-Incline-Curl_Upper-Arms'],
  ['curl_conc',     'Curl concentrado',                   'Bíceps', 'cabeza_corta', 'kg_reps', 'curl_aisl','02971301-Dumbbell-Concentration-Curl_Upper-Arms'],
  ['curl_scott',    'Curl en banco Scott',                'Bíceps', 'cabeza_corta', 'kg_reps', 'curl_aisl','00701301-Barbell-Preacher-Curl_Upper-Arms'],
  ['curl_polea',    'Curl en polea baja',                 'Bíceps', 'cabeza_corta', 'kg_reps', 'curl_aisl','08681301-Cable-Curl-m_Upper-Arms'],
  ['cm',            'Curl martillo',                      'Bíceps', 'braquial',     'kg_reps', 'martillo', '02981301-Dumbbell-Cross-Body-Hammer-Curl_Forearms'],
  ['cm_cuerda',     'Curl martillo en polea con cuerda',  'Bíceps', 'braquial',     'kg_reps', 'martillo', '01651301-Cable-Hammer-Curl-with-rope-m_Forearms'],
  ['curl_inverso',  'Curl invertido con barra EZ',        'Bíceps', 'braquial',     'kg_reps', 'martillo', '04511301-EZ-Barbell-Reverse-Grip-Curl_Forearms'],

  // ── TRÍCEPS ──
  ['et',            'Extensión de tríceps en polea',      'Tríceps', 'lateral',      'kg_reps', 'pushdown',   '02411301-Cable-Triceps-Pushdown-V-bar-attachment_Upper-Arms'],
  ['et_uni',        'Extensión de tríceps unilateral polea','Tríceps', 'lateral',    'kg_reps', 'pushdown',   '17231301-Cable-One-Arm-Tricep-Pushdown_Upper-Arms'],
  ['et_supino',     'Extensión de tríceps agarre supino', 'Tríceps', 'lateral',      'kg_reps', 'pushdown',   '16061301-Cable-Reverse-Grip-Triceps-Pushdown-SZ-bar_Upper-arms'],
  ['patada',        'Patada de tríceps con mancuerna',    'Tríceps', 'lateral',      'kg_reps', 'pushdown',   '03331301-Dumbbell-Kickback_Upper-Arms'],
  ['pf',            'Press francés con barra',            'Tríceps', 'cabeza_larga', 'kg_reps', 'frances',    '00601301-Barbell-Lying-Triceps-Extension-Skull-Crusher_Triceps-SFIX'],
  ['pf_manc',       'Press francés inclinado mancuernas', 'Tríceps', 'cabeza_larga', 'kg_reps', 'frances',    '03301301-Dumbbell-Incline-Triceps-Extension_Upper-Arms'],
  ['ext_nuca_polea','Extensión sobre la cabeza con cuerda','Tríceps','cabeza_larga', 'kg_reps', 'frances',    '01941301-Cable-Overhead-Triceps-Extension-rope-attachment_Upper-Arms'],
  ['ext_nuca_manc', 'Extensión tras nuca con mancuerna',  'Tríceps', 'cabeza_larga', 'kg_reps', 'frances',    '21881301-Dumbbell-Seated-Triceps-Extension_Upper-Arms'],
  ['press_cerrado', 'Press banca agarre cerrado',         'Tríceps', 'medial',       'kg_reps', null,         '00301301-Barbell-Close-Grip-Bench-Press_Upper-Arms'],
  ['fondos_banco',  'Fondos en banco',                    'Tríceps', 'medial',       'reps',    null,         '08121301-Triceps-Dip-bench-leg_Upper-Arms'],

  // ── PIERNA ──
  ['sq',            'Sentadilla con barra',               'Pierna', 'cuadriceps',  'kg_reps', 'sentadilla', '00431301-Barbell-Full-Squat_Thighs', true],
  ['sg',            'Sentadilla goblet',                  'Pierna', 'cuadriceps',  'kg_reps', 'sentadilla', '17601301-Dumbbell-Goblet-Squat_Thighs-FIX'],
  ['hack',          'Sentadilla hack',                    'Pierna', 'cuadriceps',  'kg_reps', 'sentadilla', '19921301-Sled-Full-Hack-Squat_Thighs'],
  ['pr',            'Prensa 45°',                         'Pierna', 'cuadriceps',  'kg_reps', 'prensa',     '07401301-Sled-45deg-Leg-Wide-Press_Thighs'],
  ['pr_cerrada',    'Prensa 45° pies juntos',             'Pierna', 'cuadriceps',  'kg_reps', 'prensa',     '15751301-Sled-45deg-Narrow-Stance-Leg-Press_Thighs'],
  ['zancada',       'Zancadas con mancuernas',            'Pierna', 'cuadriceps',  'kg_reps', 'unilateral', '03361301-Dumbbell-Lunge_Hips'],
  ['zancada_atras', 'Zancada atrás con mancuernas',       'Pierna', 'cuadriceps',  'kg_reps', 'unilateral', '03811301-Dumbbell-Rear-Lunge_Thighs'],
  ['bulgara',       'Sentadilla búlgara',                 'Pierna', 'cuadriceps',  'kg_reps', 'unilateral', '04101301-Dumbbell-Single-Leg-Split-Squat_Thighs'],
  ['step_up',       'Step-up con mancuernas',             'Pierna', 'cuadriceps',  'kg_reps', 'unilateral', '04311301-Dumbbell-Step-up_Hips'],
  ['ec',            'Extensión de cuádriceps',            'Pierna', 'cuadriceps',  'kg_reps', null,         '05851301-Lever-Leg-Extension_Thighs'],
  ['pmr',           'Peso muerto rumano con barra',       'Pierna', 'isquiotibiales','kg_reps','bisagra',   '00851301-Barbell-Romanian-Deadlift_Hips'],
  ['pmr_manc',      'Peso muerto rumano con mancuernas',  'Pierna', 'isquiotibiales','kg_reps','bisagra',   '14591301-Dumbbell-Romanian-Deadlift_Hips'],
  ['buenos_dias',   'Buenos días con barra',              'Pierna', 'isquiotibiales','kg_reps','bisagra',   '00441301-Barbell-Good-Morning_Thighs', true],
  ['pmk',           'Peso muerto convencional',           'Pierna', 'isquiotibiales','kg_reps','peso_muerto','00321301-Barbell-Deadlift_Hips-FIX', true],
  ['pm_sumo',       'Peso muerto sumo',                   'Pierna', 'gluteos',     'kg_reps', 'peso_muerto','01171301-Barbell-Sumo-Deadlift_Hips', true],
  ['cf',            'Curl femoral tumbado',               'Pierna', 'isquiotibiales','kg_reps','femoral',   '05861301-Lever-Lying-Leg-Curl_Thighs'],
  ['cf_sentado',    'Curl femoral sentado',               'Pierna', 'isquiotibiales','kg_reps','femoral',   '05991301-Lever-Seated-Leg-Curl_Thighs-FIX'],
  ['cf_pie',        'Curl femoral de pie en polea',       'Pierna', 'isquiotibiales','kg_reps','femoral',   '15471301-Cable-Standing-Leg-Curl_Thighs'],
  ['hip_thrust',    'Hip thrust con barra',               'Pierna', 'gluteos',     'kg_reps', 'gluteo',     '10601301-Barbell-Hip-Thrust_Hips'],
  ['puente_gluteo', 'Puente de glúteo con mancuerna',     'Pierna', 'gluteos',     'kg_reps', 'gluteo',     '33351301-Dumbbell-Glute-Bridge_Hip'],
  ['abductor',      'Abducción de cadera en máquina',     'Pierna', 'gluteos',     'kg_reps', 'gluteo_aisl','05971301-Lever-Seated-Hip-Abduction_Hips-FIX'],
  ['patada_gluteo', 'Patada de glúteo en máquina',        'Pierna', 'gluteos',     'kg_reps', 'gluteo_aisl','10371301-Lever-Standing-Rear-Kick_Hips'],
  ['gp',            'Gemelos de pie con barra',           'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '01081301-Barbell-Standing-Leg-Calf-Raise_Calf'],
  ['gem_maquina',   'Gemelos de pie en máquina',          'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '06051301-Lever-Standing-Calf-Raise_Calf'],
  ['gem_sentado',   'Gemelos sentado en máquina',         'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '26661301-Lever-Seated-Calf-Raise-plate-loaded-VERSION-2_Calves'],
  ['gem_prensa',    'Gemelos en prensa',                  'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '13911301-Sled-Calf-Press-On-Leg-Press_Calves'],

  // ── CORE ──
  ['pl',            'Plancha frontal',                    'Core', 'transverso', 'seg',     'plancha',      '04631301-Front-Plank_waist-FIX'],
  ['pl_lateral',    'Plancha lateral',                    'Core', 'oblicuos',   'seg',     'plancha',      '07151301-Side-Plank-m_Waist'],
  ['pl_rodillas',   'Plancha con rodillas apoyadas',      'Core', 'transverso', 'seg',     null,           '32381301-Kneeling-plank-male_Waist'],
  ['rueda',         'Rueda abdominal',                    'Core', 'transverso', 'reps',    'plancha',      '08571301-Wheel-Rollout_Waist-FIX'],
  ['crp',           'Crunch en polea de rodillas',        'Core', 'recto',      'kg_reps', 'crunch',       '01751301-Cable-Kneeling-Crunch_Waist-FIX'],
  ['crunch_maquina','Crunch en máquina',                  'Core', 'recto',      'kg_reps', 'crunch',       '05951301-Lever-Seated-Crunch-chest-pad_Waist'],
  ['crunch_suelo',  'Abdominal en suelo (sit-up)',        'Core', 'recto',      'reps',    'crunch_libre', '36791301-Sit-up-with-Arms-on-Chest_Waist'],
  ['crunch_inverso','Crunch inverso',                     'Core', 'recto',      'reps',    'crunch_libre', '22061301-Roll-Reverse-Crunch_Waist'],
  ['evp',           'Elevación de rodillas colgado',      'Core', 'recto',      'reps',    'piernas_core', '17641301-Hanging-Leg-Hip-Raise_Waist'],
  ['evp_soporte',   'Elevación de piernas en soporte',    'Core', 'recto',      'reps',    'piernas_core', '08261301-Vertical-Leg-Raise-on-parallel-bars_Hips'],
  ['evp_rectas',    'Elevación de piernas rectas colgado','Core', 'recto',      'reps',    'piernas_core', '04751301-Hanging-Straight-Leg-Raise_Hips'],
  ['russian',       'Russian twist con mancuerna',        'Core', 'oblicuos',   'reps',    'oblicuo',      '34491301-Dumbbell-Russian-Twist_Waist'],
  ['pallof',        'Press Pallof en polea',              'Core', 'oblicuos',   'kg_reps', 'oblicuo',      '41931301-Cable-Half-Kneeling-Pallof-Press_Waist'],

  // ── AMPLIACIÓN nov-2026 (GIF verificado por nombre de archivo) ──
  ['press_squeeze',  'Press squeeze con mancuernas',        'Pecho', 'interno',  'kg_reps', 'press_plano',   '36811301-Dumbbell-Squeeze-Bench-Press_Chest'],
  ['svend',          'Press Svend con disco',               'Pecho', 'interno',  'kg_reps', 'aperturas',     '08561301-Weighted-Svend-Press_Chest'],
  ['flex_decl',      'Flexiones declinadas (pies elevados)','Pecho', 'alto',     'reps',    'flexiones',     '02791301-Decline-Push-Up-m_chest'],
  ['flex_abiertas',  'Flexiones agarre abierto',            'Pecho', 'medio',    'reps',    'flexiones',     '13111301-Wide-Hand-Push-up_Chest'],
  ['dom_abierta',    'Dominadas agarre abierto',            'Espalda', 'dorsal',   'reps',    'dominada',    '18661301-Wide-Grip-Pull-Up-on-Dip-Cage_Back'],
  ['remo_invertido', 'Remo invertido (australiano)',        'Espalda', 'romboides','reps',    null,          '04991301-Inverted-Row_Back-FIX'],
  ['remo_landmine',  'Remo landmine a una mano',            'Espalda', 'romboides','kg_reps', 'remo_uni',    '40381301-Landmine-One-Arm-Bent-Over-Row_Back'],
  ['press_landmine', 'Press landmine a una mano (rodilla)', 'Hombros', 'anterior', 'kg_reps', 'press_hombro','35251301-Landmine-Kneeling-One-Arm-Shoulder-Press_Shoulders'],
  ['pike',           'Flexiones pike',                      'Hombros', 'anterior', 'reps',    'hombro_libre','34011301-Pike-Push-up-between-Benches_Shoulders'],
  ['pino',           'Flexiones en pino (handstand)',       'Hombros', 'anterior', 'reps',    'hombro_libre','04711301-Handstand-Push-Up_Shoulders'],
  ['el_inclinado',   'Elevación lateral inclinado en polea','Hombros', 'lateral',  'kg_reps', 'lateral',     '38801301-Cable-Leaning-Lateral-Raise_Shoulders'],
  ['y_raise',        'Elevación en Y en banco inclinado',   'Hombros', 'lateral',  'kg_reps', 'lateral',     '35411301-Dumbbell-Incline-Y-Raise_Shoulders'],
  ['remo_menton_barra','Remo al mentón con barra',          'Hombros', 'lateral',  'kg_reps', 'lateral',     '01201301-Barbell-Upright-Row_shoulder', true],
  ['remo_menton_polea','Remo al mentón en polea',           'Hombros', 'lateral',  'kg_reps', 'lateral',     '02461301-Cable-Upright-Row_shoulder'],
  ['remo_posterior', 'Remo para deltoides posterior',       'Hombros', 'posterior','kg_reps', 'posterior',   '03771301-Dumbbell-Rear-Delt-Row_shoulder'],
  ['drag_curl',      'Curl drag con barra',                 'Bíceps', 'cabeza_larga', 'kg_reps', 'curl',     '00381301-Barbell-Drag-Curl_Upper-Arms'],
  ['spider_curl',    'Curl araña con barra EZ',             'Bíceps', 'cabeza_corta', 'kg_reps', 'curl_aisl','16281301-EZ-Barbell-Spider-Curl_Upper-Arms'],
  ['curl_scott_manc','Curl Scott con mancuerna',            'Bíceps', 'cabeza_corta', 'kg_reps', 'curl_aisl','03721301-Dumbbell-Preacher-Curl_Upper-Arms'],
  ['curl_inv_barra', 'Curl invertido con barra recta',      'Bíceps', 'braquial',     'kg_reps', 'martillo', '00801301-Barbell-Reverse-Curl_Forearm'],
  ['curl_muneca',    'Curl de muñeca con barra',            'Antebrazo', 'flexores',  'kg_reps', 'muneca',   '01251301-Barbell-Wrist-Curl-II_Forearms'],
  ['curl_muneca_inv','Curl de muñeca invertido con barra',  'Antebrazo', 'extensores','kg_reps', 'muneca',   '00791301-Barbell-Revers-Wrist-Curl-II_Forearms'],
  ['rodillo_muneca', 'Rodillo de muñeca',                   'Antebrazo', 'flexores',  'kg_reps', 'muneca',   '08591301-Wrist-Roller_Forearms'],
  ['paseo_granjero', 'Paseo del granjero',                  'Antebrazo', 'agarre',    'seg',     null,       '21331301-Farmers-walk_Cardio'],
  ['patada_polea',   'Patada de tríceps en polea',          'Tríceps', 'lateral',      'kg_reps', 'pushdown', '08601301-Cable-kickback_Upper-arms'],
  ['tate',           'Press Tate con mancuernas',           'Tríceps', 'medial',       'kg_reps', null,       '04361301-Dumbbell-Tate-Press_Triceps'],
  ['flex_diamante',  'Flexiones diamante',                  'Tríceps', 'medial',       'reps',    'triceps_libre','02831301-Diamond-Push-up_Upper-Arms'],
  ['fondos_triceps', 'Fondos de tríceps (torso vertical)',  'Tríceps', 'medial',       'reps',    'triceps_libre','08141301-Triceps-Dip_Upper-Arms'],
  ['sq_landmine',    'Sentadilla frontal landmine',         'Pierna', 'cuadriceps',  'kg_reps', 'sentadilla', '42461301-Landmine-Front-Squat_Thighs'],
  ['split_squat',    'Split squat con barra',               'Pierna', 'cuadriceps',  'kg_reps', 'unilateral', '30301301-Barbell-Split-Squat_Thighs', true],
  ['zancada_cruzada','Zancada cruzada goblet',              'Pierna', 'gluteos',     'kg_reps', 'unilateral', '36831301-Dumbbell-Gobelt-Curtsey-Lunge_Thighs'],
  ['zancada_lateral','Zancada lateral con barra',           'Pierna', 'aductores',   'kg_reps', 'unilateral', '14101301-Barbell-Lateral-Lunge_Hips', true],
  ['pm_unipodal',    'Peso muerto a una pierna mancuernas', 'Pierna', 'isquiotibiales','kg_reps','bisagra',   '17571301-Dumbbell-Single-Leg-Deadlift_Hips'],
  ['pm_rigidas_manc','Peso muerto piernas rígidas mancuernas','Pierna','isquiotibiales','kg_reps','bisagra',   '04321301-Dumbbell-Stiff-Leg-Deadlift_Waist'],
  ['rack_pull',      'Rack pull (peso muerto parcial)',     'Pierna', 'isquiotibiales','kg_reps','peso_muerto','00741301-Barbell-Rack-Pull_Hips-FIX', true],
  ['puente_barra',   'Puente de glúteo con barra',          'Pierna', 'gluteos',     'kg_reps', 'gluteo',     '29641301-Barbell-Glute-Bridge-hands-on-bar_Hips'],
  ['abduccion_polea','Abducción de cadera en polea',        'Pierna', 'gluteos',     'kg_reps', 'gluteo_aisl','30481301-Cable-hip-abduction-version-2-male_Hips'],
  ['aductor',        'Aducción de cadera en máquina',       'Pierna', 'aductores',   'kg_reps', null,         '05981301-Lever-Seated-Hip-Adduction_Thighs'],
  ['gem_burro',      'Gemelos tipo burro en máquina',       'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '12531301-Lever-Donkey-Calf-Raise_Calves'],
  ['gem_manc',       'Gemelos de pie con mancuernas',       'Pierna', 'gemelos',     'kg_reps', 'gemelos',    '04171301-Dumbbell-Standing-Calf-Raise_Calf'],
  ['hollow',         'Hollow hold',                         'Core', 'transverso', 'seg',     'plancha',      '12461301-Hollow-Hold_Waist'],
  ['dragon_flag',    'Dragon flag',                         'Core', 'recto',      'reps',    'piernas_core', '40581301-Leg-Raise-Dragon-Flag_Waist'],
  ['evp_oblicuo',    'Elevación de rodillas oblicua colgado','Core','oblicuos',   'reps',    'piernas_core', '17611301-Hanging-Oblique-Knee-Raise_Waist'],
  ['v_up',           'V-up con mancuerna',                  'Core', 'recto',      'reps',    'crunch_libre', '33361301-Dumbbell-V-up_Waist'],
  ['bici_abs',       'Crunch bicicleta',                    'Core', 'oblicuos',   'reps',    'oblicuo',      '00031301-air-bike-m_waist_FIX'],
  ['escaladores',    'Escaladores (mountain climbers)',     'Cardio', 'metabolico', 'seg',   'cardio',       '06301301-Mountain-Climber_Cardio'],
  ['burpee',         'Burpees',                             'Cardio', 'metabolico', 'reps',  null,           '11601301-Burpee_Cardio'],
  ['comba',          'Saltar a la comba',                   'Cardio', 'metabolico', 'seg',   'cardio',       '26121301-Jump-Rope-male_Cardio'],
  ['remo_ergo',      'Remo ergómetro',                      'Cardio', 'metabolico', 'seg',   'cardio',       '11611301-Rowing-with-rowing-machine_Cardio'],
  ['assault_bike',   'Bicicleta de aire (assault bike)',    'Cardio', 'metabolico', 'seg',   'cardio',       '38931301-Assault-Bike-Run_Cardio'],
]

export const CATALOGO = Object.fromEntries(RAW.map(([id, nombre, grupo, zona, metrica, familia, gif, barra]) =>
  [id, { id, nombre, grupo, zona, metrica, familia, gif: g(gif), barra: !!barra }]))

export const FAMILIAS = RAW.reduce((acc, [id, , , , , familia]) => {
  if (familia) (acc[familia] ||= []).push(id)
  return acc
}, {})

// ── Traduce un ejercicio de plantilla (id antiguo + nombre) al id del catálogo ──
// Antes varios ejercicios distintos compartían id ('cb' = curl EZ, concentrado
// y mancuernas) y mezclaban su historial. Aquí se separan.
export function resolverIdCatalogo(id, nombre = '') {
  const n = nombre.toLowerCase()
  switch (id) {
    case 'pi':  return n.includes('barra') ? 'pi_barra' : 'pi'
    case 'pf':  return n.includes('mancuerna') ? 'pf_manc' : 'pf'
    case 'jp':  return n.includes('dominada') ? 'dom' : 'jp'
    case 'rb':  return n.includes('pendlay') ? 'pendlay' : 'rb'
    case 'cb':  return n.includes('concentrado') ? 'curl_conc' : n.includes('mancuerna') ? 'curl_manc' : 'cb'
    case 'pm':  return n.includes('máquina') ? 'pm_maquina' : n.includes('mancuerna') ? 'pm_manc' : 'pm'
    case 'pmr': return n.includes('mancuerna') ? 'pmr_manc' : 'pmr'
    case 'crp': return n.includes('suelo') ? 'crunch_suelo' : 'crp'
    default:    return CATALOGO[id] ? id : null
  }
}

// Sufijo de intención de la plantilla que se conserva junto al nombre canónico
export function sufijoPlantilla(nombre = '') {
  const m = nombre.match(/\((heavy|principal|técnica|accesorio|pesadas|65-75%)\)/i)
  return m ? ` (${m[1]})` : ''
}

// ── Rotación por bloques ───────────────────────────────────────────────────
// Evidencia (Kassiano 2022, Baz-Valle 2019): variar de forma planificada cada
// 4-8 semanas mantiene la motivación y puede mejorar la hipertrofia regional;
// cambiar cada sesión no aporta y dificulta la sobrecarga progresiva.
//   · accesorios: cada uno cambia cada 8 semanas, escalonados (cada 4 semanas
//     cambia aproximadamente la mitad)
//   · ejercicio principal del día: cada 12 semanas
//   · objetivo fuerza: el principal NO rota (especificidad)
const EPOCH = Date.UTC(2024, 0, 1)
// Semanas (lunes a domingo, hora local) desde el lunes 1/1/2024
function semanasDesdeEpoch(fecha) {
  const dia = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  return Math.floor((dia - EPOCH) / (7 * 864e5))
}
export function bloqueDeFecha(fecha = new Date()) {
  return Math.floor(semanasDesdeEpoch(fecha) / 4)
}
export function semanasHastaRotacion(fecha = new Date()) {
  return 4 - (semanasDesdeEpoch(fecha) % 4)
}

// ── Aplica rotación + alternativas elegidas a los días del plan ─────────────
// Cada ejercicio resultante lleva:
//   slot   → id del ejercicio del plan (hueco que ocupa)
//   regId  → id del ejercicio REAL que se hace (clave del historial)
//   motivo → null | 'rotacion' | 'manual'
//   bloqueInicio → bloque en que el usuario empezó: el primer bloque siempre es
//   el plan original; después cada 4 semanas cambia ~la mitad de los accesorios
//   (alternando huecos pares/impares) y el principal cada 12 semanas.
export function construirDiasVisibles(dias, { alternativas = {}, fecha = new Date(), objetivo, bloqueInicio } = {}) {
  const bloque = bloqueDeFecha(fecha)
  const rel = bloqueInicio == null ? 0 : Math.max(0, bloque - bloqueInicio)
  return dias.map(d => {
    const evitarBarra = !!d._perfil?.evitarBarra
    const ocupados = new Set(d.ejercicios.map(e => e.id))
    const ejercicios = d.ejercicios.map((ej, idx) => {
      const slot = ej.id
      const manual = typeof alternativas[slot] === 'string' && CATALOGO[alternativas[slot]] ? alternativas[slot] : null
      let realId = slot
      let motivo = null
      if (manual) {
        realId = manual
        motivo = manual === slot ? null : 'manual'
      } else {
        const fijo = (objetivo === 'fuerza' && idx === 0) || /\((heavy|principal|técnica)\)/i.test(ej.nombre) || !CATALOGO[slot]
        if (!fijo) {
          const cands = candidatosRotacion(slot, { evitarBarra })
          if (cands.length > 1) {
            const b = idx === 0 ? Math.floor(rel / 3) : Math.floor((rel + (idx % 2)) / 2)
            const start = Math.max(0, cands.indexOf(slot))
            for (let k = 0; k < cands.length; k++) {
              const c = cands[(start + b + k) % cands.length]
              if (c === slot || !ocupados.has(c)) { realId = c; break }
            }
            if (realId !== slot) { ocupados.add(realId); motivo = 'rotacion' }
          }
        }
      }
      if (realId === slot) return { ...ej, slot, regId: slot, motivo }
      const cat = CATALOGO[realId]
      return { ...ej, slot, regId: realId, motivo, id: realId, nombre: cat.nombre, gif: cat.gif, metrica: cat.metrica, grupo: cat.grupo, nombrePlan: ej.nombre }
    })
    return { ...d, ejercicios }
  })
}

export function candidatosRotacion(baseId, { evitarBarra = false } = {}) {
  const base = CATALOGO[baseId]
  if (!base?.familia) return [baseId]
  return FAMILIAS[base.familia].filter(id => id === baseId || !(evitarBarra && CATALOGO[id].barra))
}

// Alternativas manuales: misma familia primero, luego mismo grupo y zona, luego grupo
export function alternativasDe(id, { evitarBarra = false, excluir = [] } = {}) {
  const base = CATALOGO[id]
  if (!base) return []
  const todos = Object.values(CATALOGO).filter(e =>
    e.id !== id && e.grupo === base.grupo && !excluir.includes(e.id) && !(evitarBarra && e.barra))
  const peso = e => (e.familia && e.familia === base.familia ? 0 : e.zona === base.zona ? 1 : 2)
  return todos.sort((a, b) => peso(a) - peso(b))
}
