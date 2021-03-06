import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/theme-tomorrow';
import jsWorkerUrl from 'file-loader!ace-builds/src-noconflict/worker-javascript';
ace.config.setModuleUrl('ace/mode/javascript_worker', jsWorkerUrl)

import { parse, EnoParseError } from 'enojs';
import eno from 'enojs';

import { attrUnescape, htmlEscape } from '../../lib/escape.js';

const code = document.querySelector('#code');
const editor = document.querySelector('#editor');
const lookupLog = document.querySelector('#lookup');
const output = document.querySelector('#output');
const select = document.querySelector('.demo');
const selectLanguage = document.querySelector('.language');

const aceEditor = ace.edit('code', {
  fontFamily: 'Cousine',
  fontSize: '18px',
  mode: 'ace/mode/javascript',
  showGutter: false,
  theme: 'ace/theme/tomorrow'
});

const refresh = () => {
  const input = editor.value;

  try {
    const demoOption = select.selectedOptions[0];
    const languageOption = selectLanguage.selectedOptions[0].value;

    let js;
    if(languageOption === 'javascript') {
      js = aceEditor.getValue();
    } else {
      js = attrUnescape(demoOption.dataset.javascript);
    }

    const evaluate = new Function('input', 'eno', 'cursor', js);

    const result = evaluate(input, eno, editor.selectionStart);

    if(typeof result === 'object') {
      output.innerHTML = htmlEscape(JSON.stringify(result, null, 2));
    } else {
      output.innerHTML = htmlEscape(result);
    }
  } catch(err) {
    if(err instanceof EnoParseError) {
      output.innerHTML = err;
    } else {
      output.innerHTML = err;
    }
  }
};

const updateDemo = changed => {
  const demoOption = select.selectedOptions[0];
  const languageOption = selectLanguage.selectedOptions[0].value;

  if(changed === 'demo') {
    editor.value = attrUnescape(demoOption.dataset.eno);
    document.querySelector('#text').innerHTML = attrUnescape(demoOption.dataset.text);
  }

  if(languageOption === 'javascript') {
    aceEditor.setValue(attrUnescape(demoOption.dataset.javascript));
    aceEditor.session.setMode('ace/mode/javascript');
    aceEditor.setReadOnly(false);
  } else if(languageOption === 'python') {
    aceEditor.setValue(attrUnescape(demoOption.dataset.python));
    aceEditor.session.setMode('ace/mode/python');
    aceEditor.setReadOnly(true);
  } else if(languageOption === 'ruby') {
    aceEditor.setValue(attrUnescape(demoOption.dataset.ruby));
    aceEditor.session.setMode('ace/mode/ruby');
    aceEditor.setReadOnly(true);
  }

  aceEditor.gotoLine(1);

  refresh();
};

select.addEventListener('change', () => updateDemo('demo'));
selectLanguage.addEventListener('change', () => updateDemo('language'));

editor.addEventListener('click', refresh);
editor.addEventListener('focus', refresh);
editor.addEventListener('input', refresh);
editor.addEventListener('keyup', event => {
  if(['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
    refresh();
  }
});

aceEditor.on('change', refresh);

refresh();
