const kuldoncokGame = (() => {
    let state = {
        level: null,
        field: [[]],
        previous: {
            row: null,
            col: null
        },
        highlightingStarted: {
            row: null,
            col: null
        },
        isDrawing: false,
        currentColor: null
    };

    const table = document.querySelector('.table');

    function initialize(initalField, level) {
        state.field = initalField;
        state.level = level;
        render();

        window.oncontextmenu = _ => false;

        if (localStorage.getItem(state.level)) {
            document.querySelector('.button-load').style.display = 'inline';
        }

        table.addEventListener('mousedown', onMouseDown);

        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseDown(ev) {
        const currentRow = parseInt(ev.target.dataset.row);
        const currentCol = parseInt(ev.target.dataset.col);
        const currentCell = state.field[currentRow][currentCol];

        if (ev.button !== 0 || !currentCell.value) {
            return;
        }

        state.isDrawing = true;
        state.currentColor = currentCell.value;
        state.highlightingStarted.row = currentRow;
        state.highlightingStarted.col = currentCol;
        state.previous.row = currentRow;
        state.previous.col = currentCol;

        currentCell.color = currentCell.value;

        render();
    }

    function onMouseEnter(ev) {
        if (!state.isDrawing) {
            return;
        }

        const currentRow = parseInt(ev.target.dataset.row);
        const currentCol = parseInt(ev.target.dataset.col);
        const currentCell = state.field[currentRow][currentCol];

        if (currentCell.value && state.currentColor && currentCell.value !== state.currentColor) {
            return;
        }

        if (state.previous.row !== null && state.previous.col !== null) {
            const step =
                Math.abs(currentRow - state.previous.row) +
                Math.abs(currentCol - state.previous.col);
            if (
                (currentRow === state.previous.row && currentCol === state.previous.col) ||
                step > 1
            ) {
                return;
            } else if (currentCell.color === state.field[state.previous.row][state.previous.col].color) {
                state.field[state.previous.row][state.previous.col].color = null;
                state.previous.row = parseInt(currentRow);
                state.previous.col = parseInt(currentCol);
                return render();
            }
        }

        if (!currentCell.color) {
            currentCell.color = state.currentColor;
            state.previous.row = parseInt(currentRow);
            state.previous.col = parseInt(currentCol);
            return render();
        }
    }

    function onMouseUp(ev) {
        if (!ev.target.classList.contains('col')) {
            return deleteColorHighlighting();
        }

        const currentRow = parseInt(ev.target.dataset.row);
        const currentCol = parseInt(ev.target.dataset.col);
        const currentCell = state.field[currentRow][currentCol];

        if (ev.button === 2) {
            return deleteColorHighlighting(
                state.field[ev.target.dataset.row][ev.target.dataset.col].color
            );
        }

        if (
            state.currentColor !== currentCell.value ||
            (state.highlightingStarted.row === currentRow &&
                state.highlightingStarted.col === currentCol)
        ) {
            return deleteColorHighlighting();
        }

        state.currentColor = null;
        state.previous.row = null;
        state.previous.col = null;
        state.isDrawing = false;

        checkWinner();
    }

    function deleteColorHighlighting(color = state.currentColor) {
        state.field.forEach(row => {
            row.forEach(col => {
                if (col.color === color) {
                    col.color = null;
                }
            });
        });
        state.currentColor = null;
        state.previous.row = null;
        state.previous.col = null;
        state.isDrawing = false;

        render();
    }

    function checkWinner() {
        if (state.field.every(row => row.every(col => col.color))) {
            localStorage.removeItem(state.level);
            document.querySelector('.button-wrapper').style.display = 'none';
            alert('Gratulálok, nyertél!');
            document.querySelector('.back-button').style.display = 'block';
        }
    }

    function loadGame() {
        state.field = JSON.parse(localStorage.getItem(state.level));
        localStorage.removeItem(state.level);
        document.querySelector('.button-load').style.display = 'none';
        render();
    }

    function saveGame() {
        if (localStorage.getItem(state.level)) {
            return (
                confirm('Rendelkezel korábbi mentéssel! Felül szeretnéd írni?') &&
                localStorage.setItem(state.level, JSON.stringify(state.field))
            );
        }
        localStorage.setItem(state.level, JSON.stringify(state.field));
        document.querySelector('.button-load').style.display = 'inline';
    }

    function render() {
        table.innerHTML = state.field
            .map((row, rowIdx) => {
                const cols = row
                    .map(
                        (col, colIdx) =>
                            `<div class="col ${
                                col.color ? 'color-' + col.color : ''
                            }" data-row="${rowIdx}" data-col="${colIdx}" onmouseenter="kuldoncokGame.onMouseEnter(event)">${col.value || ''}</div>`
                    )
                    .join('');
                return `<div class="row">${cols}</div>`;
            })
            .join('');
    }

    return {
        init: initialize,
        onMouseEnter,
        save: saveGame,
        load: loadGame
    };
})();
