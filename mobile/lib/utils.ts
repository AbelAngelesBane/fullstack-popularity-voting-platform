export function dateFormatter({date}:{date:string}){
  const readable = new Date(date).toLocaleString('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  });
  return readable
}