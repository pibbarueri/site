export const SITE = {
  name: "Primeira Igreja Batista em Barueri",
  shortName: "PIB Barueri",
  url: "https://pibbarueri.org.br",
  email: "contato@pibbarueri.org.br",
  pastorEmail: "marcio@pibbarueri.org.br",
  address: ["Rua Vitória, 283", "Vila São Jorge", "Barueri, SP"],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rua+Vit%C3%B3ria%2C+283%2C+Vila+S%C3%A3o+Jorge%2C+Barueri%2C+SP",
  social: {
    instagram: "https://www.instagram.com/pibbarueri",
    facebook: "https://www.facebook.com/pibbarueri",
    youtube: "https://www.youtube.com/@pibbarueri",
  },
  youtubeChannelId: "UCMpwkqa-OEOFZ8_bN8kTg6w",
  // Public IDs of the Google files the church staff edits.
  calendarIcsUrl:
    "https://calendar.google.com/calendar/ical/c_d27ef8cd1aa2282446793eecf7d08ce5758649b8b3b809d236c1158d8ad1a1e4%40group.calendar.google.com/public/basic.ics",
  calendarSubscribeUrl:
    "https://calendar.google.com/calendar/u/0?cid=Y19kMjdlZjhjZDFhYTIyODI0NDY3OTNlZWNmN2QwOGNlNTc1ODY0OWI4YjNiODA5ZDIzNmMxMTU4ZDhhZDFhMWU0QGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20",
  sheetId: "1QcQbhlU52xANFdHEUNG2VN141-uDXEJeqK6S_rqfGp8",
  ministriesDocId: "1twCge20TtZXN-vZrMX82ZZRCpY8TgrnnH73T8gbuorQ",
  timeZone: "America/Sao_Paulo",
} as const;

export type ScheduleItem = {
  day: string;
  time: string;
  name: string;
  note?: string;
};

// Used while the "horarios" tab of the spreadsheet is empty.
export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    day: "Quarta-feira",
    time: "20h00",
    name: "GPs dos lares",
    note: "Confira o horário e o endereço com o líder do seu Grupo Pequeno.",
  },
  {
    day: "Sábado",
    time: "17h00",
    name: "GP dos Adolescentes",
    note: "Na PIBB.",
  },
  { day: "Domingo", time: "09h30", name: "Escola Bíblica Dominical (EBD)" },
  {
    day: "Domingo",
    time: "17h00",
    name: "EBD+",
    note: "Para novos membros e preparação para o batismo.",
  },
  { day: "Domingo", time: "18h30", name: "Culto" },
];
