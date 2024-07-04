// scripts.js
document.addEventListener('DOMContentLoaded', () => {
  const addPlayerBtn = document.getElementById('add-player');
  const playerNameInput = document.getElementById('player-name');
  const playersList = document.getElementById('players-list');

  addPlayerBtn.addEventListener('click', () => {
      const playerName = playerNameInput.value.trim();
      if (playerName) {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${playerName}</td>
              <td>0</td>
          `;
          playersList.appendChild(row);
          playerNameInput.value = '';
      }
  });
});
