var numRows = 0;
function makeRow() {
  numRows +=1
  const row = $(`<div id="row-${numRows}"><input type="text" class="name"/><input type="color" class="color" id="html5colorpicker" "></div>`);
  const div = $('#controls');
  console.log(div)
  console.log(row)
  div.append(row)
  
}

function launch() {
  options = []

  for(let i =0; i< numRows; i++) {
    const row = $(`#row-${i}`)
    const name = row.find('.name').val()
    const color = row.find('.color').val()
    if (name) {
      options.push({name, color})
    }
  }

  window.location = '/index.html?' + encodeURIComponent(JSON.stringify(options));
}

function initControls() {
  const div = $('#controls')
  makeRow();
  makeRow();
  makeRow();
  makeRow();
  makeRow();
  makeRow();
  $('#launch').click(launch);
  console.log('init')

}

$(document).ready(initControls)