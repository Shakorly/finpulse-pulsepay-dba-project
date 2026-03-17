export const fmt = {
  currency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style:'currency', currency, minimumFractionDigits:2
    }).format(amount)
  },
  number(n) { return new Intl.NumberFormat('en-US').format(n) },
  compact(n) { return new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n) },
  date(d) { return new Intl.DateTimeFormat('en-US',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d)) },
  dateTime(d) { return new Intl.DateTimeFormat('en-US',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(d)) },
  pct(n, total) { if (!total) return '0%'; return ((n/total)*100).toFixed(1)+'%' }
}
