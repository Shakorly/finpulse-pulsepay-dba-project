export const fmt = {
  currency: (n, c='USD') => new Intl.NumberFormat('en-US',{style:'currency',currency:c,minimumFractionDigits:2}).format(n),
  number:   (n) => new Intl.NumberFormat('en-US').format(n),
  date:     (d) => new Intl.DateTimeFormat('en-US',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)),
  dateTime: (d) => new Intl.DateTimeFormat('en-US',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(d)),
  ref:      (r) => r?.split('-')[0].toUpperCase() || '—'
}
