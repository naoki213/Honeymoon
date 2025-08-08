// app.js

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Firebaseの初期化
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// グラフの初期設定
let budgetChart = null;

// データ保存関数
function saveData() {
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const currency = document.getElementById("currency").value;
  const details = document.getElementById("details").value;

  // ユーロの場合、円に換算（105%のレート）
  let amountInJPY = amount;
  if (currency === "EUR") {
    amountInJPY = amount * 1.05;
  }

  // データを保存
  const expensesRef = database.ref('expenses').push();
  expensesRef.set({
    date: date,
    category: category,
    amount: amountInJPY,
    currency: currency,
    details: details
  }).then(() => {
    alert("データが保存されました！");
    loadBudgetData(); // データ保存後にグラフを更新
  }).catch((error) => {
    alert("エラーが発生しました: " + error.message);
  });
}

// Firebaseからデータを取得してグラフを描画
function loadBudgetData() {
  const expensesRef = database.ref('expenses');
  expensesRef.once('value', function(snapshot) {
    const data = snapshot.val();
    const categories = {};
    let totalAmount = 0;

    // データをカテゴリーごとに集計
    for (let id in data) {
      const expense = data[id];
      const category = expense.category;
      const amount = expense.amount;

      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += amount;
      totalAmount += amount;
    }

    // グラフデータの準備
    const labels = Object.keys(categories);
    const amounts = Object.values(categories);

    // グラフがすでに存在する場合は削除
    if (budgetChart) {
      budgetChart.destroy();
    }

    // 新しいグラフを作成
    const ctx = document.getElementById('budgetChart').getContext('2d');
    budgetChart = new Chart(ctx, {
      type: 'pie', // 円グラフ
      data: {
        labels: labels,
        datasets: [{
          data: amounts,
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return tooltipItem.label + ': ¥' + tooltipItem.raw.toLocaleString();
              }
            }
          }
        }
      }
    });

    // 残りの予算表示
    const remainingBudget = 800000 - totalAmount;
    document.getElementById('remainingBudget').textContent = '残り予算: ¥' + remainingBudget.toLocaleString();
  });
}

// 初期ロード時に予算データを表示
loadBudgetData();
