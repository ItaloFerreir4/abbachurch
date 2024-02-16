const { parse, format } = require('date-fns');

function formatarDataHora(dataHoraString) {
    const parsedDate = parse(dataHoraString, 'yyyy-MM-dd h:mm a', new Date());
    return format(parsedDate, 'yyyy-MM-dd HH:mm');
}
  

module.exports = { formatarDataHora };