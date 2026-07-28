/*
  quiz.js — reusable in-page quiz widget for lessons in this workspace.
  Radio options, immediate corrective feedback on submit, no page reload,
  no dependencies, works over file://.

  Usage:
    Quiz.mount(document.getElementById('quiz'), {
      questions: [
        { q: 'Question text?',
          options: ['A', 'B', 'C', 'D'],
          answer: 1,
          why: 'Explanation shown after submitting, right or wrong.' }
      ]
    });

  Option order is authored, not shuffled at runtime — the lesson author is
  responsible for spreading correct answers across positions so that no
  positional pattern leaks the key.
*/
const Quiz = (function () {
  function mount(root, spec) {
    if (!root) return;
    const form = document.createElement('form');
    form.noValidate = true;
    const name = (root.id || 'qz') + '-q';

    spec.questions.forEach((question, qi) => {
      const fs = document.createElement('fieldset');
      const lg = document.createElement('legend');
      lg.textContent = (qi + 1) + '. ' + question.q;
      fs.appendChild(lg);

      question.options.forEach((text, oi) => {
        const label = document.createElement('label');
        label.className = 'opt';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = name + qi;
        input.value = String(oi);
        label.appendChild(input);
        label.appendChild(document.createTextNode(text));
        fs.appendChild(label);
      });

      const fb = document.createElement('p');
      fb.className = 'fb';
      fb.id = name + qi + '-fb';
      fb.setAttribute('role', 'status');
      fs.appendChild(fb);

      form.appendChild(fs);
    });

    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Check my answers';
    form.appendChild(btn);

    const score = document.createElement('p');
    score.className = 'score';
    score.setAttribute('role', 'status');
    form.appendChild(score);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      let correct = 0, answered = 0;

      spec.questions.forEach((question, qi) => {
        const picked = form.querySelector('input[name="' + name + qi + '"]:checked');
        const fb = document.getElementById(name + qi + '-fb');
        fb.className = 'fb show';

        if (!picked) {
          fb.classList.add('no');
          fb.textContent = 'Not answered yet — pick an option.';
          return;
        }
        answered++;
        const isRight = Number(picked.value) === question.answer;
        if (isRight) correct++;
        fb.classList.add(isRight ? 'ok' : 'no');
        fb.textContent =
          (isRight ? 'Correct. ' : 'Not quite — the answer is "' +
            question.options[question.answer] + '". ') + question.why;
      });

      score.textContent = answered === 0
        ? ''
        : 'Score: ' + correct + ' of ' + spec.questions.length + '.' +
          (correct === spec.questions.length
            ? ' Solid — now try the fresh variant in chat.'
            : ' Re-run the micro-world on the ones you missed, then re-check.');
    });

    root.appendChild(form);
  }

  return { mount };
})();
