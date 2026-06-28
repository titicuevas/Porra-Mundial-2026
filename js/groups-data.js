/* Datos estáticos — grupos Mundial 2026 */
// ============================================================
// DATOS — equipos con código ISO para banderas (flagcdn.com)
// ============================================================
const groups = [
  { id:'A', teams:[
      {code:'mx',name:'México'},{code:'za',name:'Sudáfrica'},{code:'kr',name:'Corea del Sur'},{code:'cz',name:'Chequia'}],
    matches:[
      {id:'A1',home:'mx',away:'za',date:'Jue 11 Jun',hour:'21:00',venue:'Azteca, Ciudad de México'},
      {id:'A2',home:'kr',away:'cz',date:'Jue 11 Jun',hour:'04:00',venue:'Akron, Guadalajara'},
      {id:'A3',home:'cz',away:'za',date:'Jue 18 Jun',hour:'18:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'A4',home:'mx',away:'kr',date:'Jue 18 Jun',hour:'03:00',venue:'Akron, Guadalajara'},
      {id:'A5',home:'cz',away:'mx',date:'Mié 24 Jun',hour:'03:00',venue:'Azteca, Ciudad de México'},
      {id:'A6',home:'za',away:'kr',date:'Mié 24 Jun',hour:'03:00',venue:'BBVA, Monterrey'},
    ]},
  { id:'B', teams:[
      {code:'ca',name:'Canadá'},{code:'ch',name:'Suiza'},{code:'qa',name:'Qatar'},{code:'ba',name:'Bosnia-Herz.'}],
    matches:[
      {id:'B1',home:'ca',away:'ba',date:'Vie 12 Jun',hour:'21:00',venue:'BMO Field, Toronto'},
      {id:'B2',home:'qa',away:'ch',date:'Sáb 13 Jun',hour:'21:00',venue:'Levi\'s Stadium, San José'},
      {id:'B3',home:'ch',away:'ba',date:'Mié 18 Jun',hour:'21:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'B4',home:'ca',away:'qa',date:'Mié 18 Jun',hour:'00:00',venue:'BMO Field, Toronto'},
      {id:'B5',home:'ch',away:'ca',date:'Mar 24 Jun',hour:'21:00',venue:'Levi\'s Stadium, San José'},
      {id:'B6',home:'ba',away:'qa',date:'Mar 24 Jun',hour:'21:00',venue:'SoFi Stadium, Los Ángeles'},
    ]},
  { id:'C', teams:[
      {code:'br',name:'Brasil'},{code:'ma',name:'Marruecos'},{code:'ht',name:'Haití'},{code:'gb-sct',name:'Escocia'}],
    matches:[
      {id:'C1',home:'ht',away:'gb-sct',date:'Sáb 13 Jun',hour:'01:00',venue:'Gillette Stadium, Boston'},
      {id:'C2',home:'br',away:'ma',date:'Sáb 13 Jun',hour:'23:00',venue:'MetLife Stadium, Nueva York'},
      {id:'C3',home:'br',away:'ht',date:'Jue 19 Jun',hour:'02:30',venue:'MetLife Stadium, Nueva York'},
      {id:'C4',home:'gb-sct',away:'ma',date:'Jue 19 Jun',hour:'00:00',venue:'Gillette Stadium, Boston'},
      {id:'C5',home:'gb-sct',away:'br',date:'Mar 24 Jun',hour:'00:00',venue:'MetLife Stadium, Nueva York'},
      {id:'C6',home:'ma',away:'ht',date:'Mar 24 Jun',hour:'00:00',venue:'Gillette Stadium, Boston'},
    ]},
  { id:'D', teams:[
      {code:'us',name:'EE.UU.'},{code:'py',name:'Paraguay'},{code:'au',name:'Australia'},{code:'tr',name:'Turquía'}],
    matches:[
      {id:'D1',home:'us',away:'py',date:'Vie 12 Jun',hour:'01:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'D2',home:'au',away:'tr',date:'Dom 14 Jun',hour:'06:00',venue:'BC Place, Vancouver'},
      {id:'D3',home:'tr',away:'py',date:'Jue 19 Jun',hour:'05:00',venue:'AT&T Stadium, Dallas'},
      {id:'D4',home:'us',away:'au',date:'Jue 19 Jun',hour:'21:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'D5',home:'tr',away:'us',date:'Jue 25 Jun',hour:'04:00',venue:'AT&T Stadium, Dallas'},
      {id:'D6',home:'py',away:'au',date:'Jue 25 Jun',hour:'04:00',venue:'BC Place, Vancouver'},
    ]},
  { id:'E', teams:[
      {code:'de',name:'Alemania'},{code:'cw',name:'Curazao'},{code:'ci',name:'C. de Marfil'},{code:'ec',name:'Ecuador'}],
    matches:[
      {id:'E1',home:'ci',away:'ec',date:'Dom 14 Jun',hour:'01:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'E2',home:'de',away:'cw',date:'Dom 14 Jun',hour:'19:00',venue:'MetLife Stadium, Nueva York'},
      {id:'E3',home:'de',away:'ci',date:'Vie 20 Jun',hour:'22:00',venue:'AT&T Stadium, Dallas'},
      {id:'E4',home:'ec',away:'cw',date:'Vie 20 Jun',hour:'02:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'E5',home:'cw',away:'ci',date:'Jue 25 Jun',hour:'22:00',venue:'AT&T Stadium, Dallas'},
      {id:'E6',home:'ec',away:'de',date:'Jue 25 Jun',hour:'22:00',venue:'MetLife Stadium, Nueva York'},
    ]},
  { id:'F', teams:[
      {code:'nl',name:'Países Bajos'},{code:'jp',name:'Japón'},{code:'tn',name:'Túnez'},{code:'se',name:'Suecia'}],
    matches:[
      {id:'F1',home:'nl',away:'jp',date:'Dom 14 Jun',hour:'22:00',venue:'Levi\'s Stadium, San José'},
      {id:'F2',home:'se',away:'tn',date:'Dom 14 Jun',hour:'04:00',venue:'BBVA, Monterrey'},
      {id:'F3',home:'nl',away:'se',date:'Vie 20 Jun',hour:'19:00',venue:'Levi\'s Stadium, San José'},
      {id:'F4',home:'tn',away:'jp',date:'Sáb 21 Jun',hour:'06:00',venue:'BBVA, Monterrey'},
      {id:'F5',home:'jp',away:'se',date:'Mié 25 Jun',hour:'01:00',venue:'Levi\'s Stadium, San José'},
      {id:'F6',home:'tn',away:'nl',date:'Mié 25 Jun',hour:'01:00',venue:'BBVA, Monterrey'},
    ]},
  { id:'G', teams:[
      {code:'be',name:'Bélgica'},{code:'eg',name:'Egipto'},{code:'ir',name:'Irán'},{code:'nz',name:'Nueva Zelanda'}],
    matches:[
      {id:'G1',home:'ir',away:'nz',date:'Dom 15 Jun',hour:'02:00',venue:'Estadio de la Ciudad de México'},
      {id:'G2',home:'be',away:'eg',date:'Dom 15 Jun',hour:'21:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'G3',home:'be',away:'ir',date:'Sáb 21 Jun',hour:'21:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'G4',home:'eg',away:'nz',date:'Sáb 21 Jun',hour:'03:00',venue:'BC Place, Vancouver'},
      {id:'G5',home:'nz',away:'be',date:'Vie 26 Jun',hour:'03:00',venue:'BC Place, Vancouver'},
      {id:'G6',home:'ir',away:'eg',date:'Vie 26 Jun',hour:'03:00',venue:'Mercedes-Benz, Atlanta'},
    ]},
  { id:'H', teams:[
      {code:'es',name:'España'},{code:'cv',name:'Cabo Verde'},{code:'sa',name:'Arabia Saudí'},{code:'uy',name:'Uruguay'}],
    matches:[
      {id:'H1',home:'sa',away:'uy',date:'Dom 15 Jun',hour:'02:00',venue:'Akron, Guadalajara'},
      {id:'H2',home:'es',away:'cv',date:'Dom 15 Jun',hour:'18:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'H3',home:'uy',away:'cv',date:'Dom 21 Jun',hour:'00:00',venue:'Hard Rock, Miami'},
      {id:'H4',home:'es',away:'sa',date:'Dom 21 Jun',hour:'18:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'H5',home:'cv',away:'sa',date:'Jue 26 Jun',hour:'03:00',venue:'Akron, Guadalajara'},
      {id:'H6',home:'uy',away:'es',date:'Jue 26 Jun',hour:'03:00',venue:'Hard Rock, Miami'},
    ]},
  { id:'I', teams:[
      {code:'fr',name:'Francia'},{code:'sn',name:'Senegal'},{code:'no',name:'Noruega'},{code:'iq',name:'Irak'}],
    matches:[
      {id:'I1',home:'fr',away:'sn',date:'Lun 16 Jun',hour:'22:00',venue:'MetLife Stadium, Nueva York'},
      {id:'I2',home:'iq',away:'no',date:'Lun 16 Jun',hour:'02:00',venue:'AT&T Stadium, Dallas'},
      {id:'I3',home:'no',away:'sn',date:'Dom 22 Jun',hour:'02:00',venue:'AT&T Stadium, Dallas'},
      {id:'I4',home:'fr',away:'iq',date:'Dom 22 Jun',hour:'23:00',venue:'Lincoln Financial, Filadelfia'},
      {id:'I5',home:'sn',away:'iq',date:'Jue 26 Jun',hour:'20:00',venue:'Lincoln Financial, Filadelfia'},
      {id:'I6',home:'no',away:'fr',date:'Jue 26 Jun',hour:'20:00',venue:'MetLife Stadium, Nueva York'},
    ]},
  { id:'J', teams:[
      {code:'ar',name:'Argentina'},{code:'dz',name:'Argelia'},{code:'at',name:'Austria'},{code:'jo',name:'Jordania'}],
    matches:[
      {id:'J1',home:'ar',away:'dz',date:'Lun 16 Jun',hour:'19:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'J2',home:'at',away:'jo',date:'Mar 17 Jun',hour:'23:00',venue:'Levi\'s Stadium, San José'},
      {id:'J3',home:'ar',away:'at',date:'Dom 22 Jun',hour:'19:00',venue:'AT&T Stadium, Dallas'},
      {id:'J4',home:'dz',away:'jo',date:'Dom 22 Jun',hour:'22:00',venue:'Mercedes-Benz, Atlanta'},
      {id:'J5',home:'at',away:'dz',date:'Jue 26 Jun',hour:'03:00',venue:'MetLife Stadium, Nueva York'},
      {id:'J6',home:'jo',away:'ar',date:'Jue 26 Jun',hour:'04:00',venue:'AT&T Stadium, Dallas'},
    ]},
  { id:'K', teams:[
      {code:'pt',name:'Portugal'},{code:'co',name:'Colombia'},{code:'uz',name:'Uzbekistán'},{code:'cd',name:'R.D. Congo'}],
    matches:[
      {id:'K1',home:'pt',away:'cd',date:'Mar 17 Jun',hour:'23:00',venue:'Levi\'s Stadium, San José'},
      {id:'K2',home:'uz',away:'co',date:'Mar 17 Jun',hour:'04:00',venue:'Azteca, Ciudad de México'},
      {id:'K3',home:'pt',away:'uz',date:'Lun 23 Jun',hour:'23:00',venue:'Lincoln Financial, Filadelfia'},
      {id:'K4',home:'co',away:'cd',date:'Lun 23 Jun',hour:'02:00',venue:'SoFi Stadium, Los Ángeles'},
      {id:'K5',home:'uz',away:'cd',date:'Sáb 27 Jun',hour:'00:30',venue:'SoFi Stadium, Los Ángeles'},
      {id:'K6',home:'co',away:'pt',date:'Sáb 27 Jun',hour:'00:30',venue:'Lincoln Financial, Filadelfia'},
    ]},
  { id:'L', teams:[
      {code:'gb-eng',name:'Inglaterra'},{code:'hr',name:'Croacia'},{code:'gh',name:'Ghana'},{code:'pa',name:'Panamá'}],
    matches:[
      {id:'L1',home:'gh',away:'pa',date:'Mar 17 Jun',hour:'23:00',venue:'AT&T Stadium, Dallas'},
      {id:'L2',home:'gb-eng',away:'hr',date:'Mar 17 Jun',hour:'21:00',venue:'Lincoln Financial, Filadelfia'},
      {id:'L3',home:'gb-eng',away:'gh',date:'Lun 23 Jun',hour:'21:00',venue:'MetLife Stadium, Nueva York'},
      {id:'L4',home:'hr',away:'pa',date:'Lun 23 Jun',hour:'23:00',venue:'BC Place, Vancouver'},
      {id:'L5',home:'pa',away:'gb-eng',date:'Sáb 27 Jun',hour:'22:00',venue:'AT&T Stadium, Dallas'},
      {id:'L6',home:'gh',away:'hr',date:'Sáb 27 Jun',hour:'22:00',venue:'BC Place, Vancouver'},
    ]},
];
