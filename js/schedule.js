/* Calendario único — fase de grupos + eliminatorias FIFA (CEST, peninsular) */
(function () {
  window.PORRA_SCHEDULE = {
    groupsClose: '2026-06-11T21:00:00+02:00',
    leaderboardOpen: '2026-06-27T00:00:00+02:00',
    extrasOpen: '2026-06-01T00:00:00+02:00'
  };

  /** Apertura de pronósticos por ronda (cierra al pitido del 1er partido de la ronda). */
  const ROUND_OPENS = {
    r32: '2026-06-28T10:00:00+02:00',
    r16: '2026-07-04T10:00:00+02:00',
    r8: '2026-07-08T08:00:00+02:00',
    r4: '2026-07-14T07:00:00+02:00',
    r2: '2026-07-19T07:00:00+02:00'
  };

  /** Dieciseisavos P73–P88 (índice en array = slot KO32-N). sortAt ordena en la quiniela. */
  const R32_META = [
    { fifaNo: 79, date: 'Mié 1 Jul', hour: '03:00', venue: 'Estadio Azteca, Ciudad de México', sortAt: '2026-07-01T03:00:00+02:00' },
    { fifaNo: 73, date: 'Dom 28 Jun', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-06-28T21:00:00+02:00' },
    { fifaNo: 76, date: 'Lun 29 Jun', hour: '19:00', venue: 'NRG Stadium, Houston', sortAt: '2026-06-29T19:00:00+02:00' },
    { fifaNo: 74, date: 'Lun 29 Jun', hour: '22:30', venue: 'Gillette Stadium, Boston', sortAt: '2026-06-29T22:30:00+02:00' },
    { fifaNo: 81, date: 'Jue 2 Jul', hour: '02:00', venue: "Levi's Stadium, San Francisco", sortAt: '2026-07-02T02:00:00+02:00' },
    { fifaNo: 85, date: 'Vie 3 Jul', hour: '05:00', venue: 'BC Place, Vancouver', sortAt: '2026-07-03T05:00:00+02:00' },
    { fifaNo: 84, date: 'Mié 2 Jul', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-07-02T21:00:00+02:00' },
    { fifaNo: 77, date: 'Mar 30 Jun', hour: '23:00', venue: 'MetLife Stadium, Nueva York', sortAt: '2026-06-30T23:00:00+02:00' },
    { fifaNo: 80, date: 'Mié 1 Jul', hour: '18:00', venue: 'Mercedes-Benz Stadium, Atlanta', sortAt: '2026-07-01T18:00:00+02:00' },
    { fifaNo: 87, date: 'Sáb 4 Jul', hour: '03:30', venue: 'Arrowhead Stadium, Kansas City', sortAt: '2026-07-04T03:30:00+02:00' },
    { fifaNo: 83, date: 'Vie 3 Jul', hour: '01:00', venue: 'BMO Field, Toronto', sortAt: '2026-07-03T01:00:00+02:00' },
    { fifaNo: 82, date: 'Mié 1 Jul', hour: '22:00', venue: 'Lumen Field, Seattle', sortAt: '2026-07-01T22:00:00+02:00' },
    { fifaNo: 86, date: 'Sáb 4 Jul', hour: '00:00', venue: 'Hard Rock Stadium, Miami', sortAt: '2026-07-04T00:00:00+02:00' },
    { fifaNo: 75, date: 'Mar 30 Jun', hour: '03:00', venue: 'Estadio BBVA, Monterrey', sortAt: '2026-06-30T03:00:00+02:00' },
    { fifaNo: 88, date: 'Vie 3 Jul', hour: '20:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-03T20:00:00+02:00' },
    { fifaNo: 78, date: 'Mar 30 Jun', hour: '19:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-06-30T19:00:00+02:00' }
  ];

  /** Octavos P89–P96 · índice = KO16-(N+1). */
  const R16_META = [
    { fifaNo: 89, date: 'Sáb 4 Jul', hour: '23:00', venue: 'Lincoln Financial Field, Filadelfia', sortAt: '2026-07-04T23:00:00+02:00' },
    { fifaNo: 90, date: 'Sáb 4 Jul', hour: '19:00', venue: 'NRG Stadium, Houston', sortAt: '2026-07-04T19:00:00+02:00' },
    { fifaNo: 91, date: 'Dom 5 Jul', hour: '22:00', venue: 'MetLife Stadium, Nueva York', sortAt: '2026-07-05T22:00:00+02:00' },
    { fifaNo: 92, date: 'Lun 6 Jul', hour: '02:00', venue: 'Estadio Azteca, Ciudad de México', sortAt: '2026-07-06T02:00:00+02:00' },
    { fifaNo: 93, date: 'Lun 6 Jul', hour: '21:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-06T21:00:00+02:00' },
    { fifaNo: 94, date: 'Mar 7 Jul', hour: '02:00', venue: 'Lumen Field, Seattle', sortAt: '2026-07-07T02:00:00+02:00' },
    { fifaNo: 95, date: 'Mar 7 Jul', hour: '18:00', venue: 'Mercedes-Benz Stadium, Atlanta', sortAt: '2026-07-07T18:00:00+02:00' },
    { fifaNo: 96, date: 'Mar 7 Jul', hour: '22:00', venue: 'BC Place, Vancouver', sortAt: '2026-07-07T22:00:00+02:00' }
  ];

  const R8_META = [
    { fifaNo: 97, date: 'Jue 9 Jul', hour: '22:00', venue: 'Gillette Stadium, Boston', sortAt: '2026-07-09T22:00:00+02:00' },
    { fifaNo: 98, date: 'Vie 10 Jul', hour: '21:00', venue: 'SoFi Stadium, Los Ángeles', sortAt: '2026-07-10T21:00:00+02:00' },
    { fifaNo: 99, date: 'Sáb 11 Jul', hour: '23:00', venue: 'Hard Rock Stadium, Miami', sortAt: '2026-07-11T23:00:00+02:00' },
    { fifaNo: 100, date: 'Dom 12 Jul', hour: '03:00', venue: 'Arrowhead Stadium, Kansas City', sortAt: '2026-07-12T03:00:00+02:00' }
  ];

  const R4_META = [
    { fifaNo: 101, date: 'Mar 14 Jul', hour: '21:00', venue: 'AT&T Stadium, Dallas', sortAt: '2026-07-14T21:00:00+02:00' },
    { fifaNo: 102, date: 'Mié 15 Jul', hour: '21:00', venue: 'Mercedes-Benz Stadium, Atlanta', sortAt: '2026-07-15T21:00:00+02:00' }
  ];

  const FINAL_META = {
    fifaNo: 104,
    date: 'Dom 19 Jul',
    hour: '21:00',
    venue: 'MetLife Stadium, Nueva York',
    sortAt: '2026-07-19T21:00:00+02:00'
  };

  /** Ganadores KO32 (índice 0–15) → cada octavo KO16-1…8. */
  const R16_FEEDERS = [
    [3, 7], [1, 13], [2, 15], [0, 8], [10, 6], [4, 11], [12, 14], [5, 9]
  ];

  /** Ganadores KO16 (índice 0–7 = M89–M96) → cuartos KO8-1…4 (P97–P100). */
  const R8_FEEDERS = [
    [0, 1], [4, 5], [2, 3], [6, 7]
  ];

  window.FIFA_KO_SCHEDULE = {
    ROUND_OPENS,
    R32_META,
    R16_META,
    R8_META,
    R4_META,
    FINAL_META,
    R16_FEEDERS,
    R8_FEEDERS
  };
})();
