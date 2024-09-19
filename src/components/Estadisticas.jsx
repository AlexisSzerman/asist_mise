import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Estadisticas() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "asistencias"));
        const asistenciasData = querySnapshot.docs.map((doc) => doc.data());
        setData(asistenciasData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Estructura para datos mensuales y anuales
  const monthlyWeekdayData = {};
  const monthlyWeekendData = {};
  const monthlyWeekdayCount = {};
  const monthlyWeekendCount = {};
  const yearlyWeekdayData = {};
  const yearlyWeekendData = {};
  const yearlyWeekdayCount = {};
  const yearlyWeekendCount = {};

  // Procesar los datos
  data.forEach(entry => {
    const date = new Date(entry.date);
    const month = entry.date.substring(0, 7); // YYYY-MM
    const year = entry.date.substring(0, 4); // YYYY
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Inicializar contadores si no existen
    if (!monthlyWeekdayData[month]) monthlyWeekdayData[month] = 0;
    if (!monthlyWeekendData[month]) monthlyWeekendData[month] = 0;
    if (!monthlyWeekdayCount[month]) monthlyWeekdayCount[month] = 0;
    if (!monthlyWeekendCount[month]) monthlyWeekendCount[month] = 0;
    if (!yearlyWeekdayData[year]) yearlyWeekdayData[year] = 0;
    if (!yearlyWeekendData[year]) yearlyWeekendData[year] = 0;
    if (!yearlyWeekdayCount[year]) yearlyWeekdayCount[year] = 0;
    if (!yearlyWeekendCount[year]) yearlyWeekendCount[year] = 0;

    // Acumulación de datos
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      monthlyWeekendData[month] += entry.total;
      monthlyWeekendCount[month] += 1;
      yearlyWeekendData[year] += entry.total;
      yearlyWeekendCount[year] += 1;
    } else { // Weekday
      monthlyWeekdayData[month] += entry.total;
      monthlyWeekdayCount[month] += 1;
      yearlyWeekdayData[year] += entry.total;
      yearlyWeekdayCount[year] += 1;
    }
  });

  // Calcular promedios
  const averageMonthlyWeekdayData = Object.keys(monthlyWeekdayData).reduce((acc, month) => {
    acc[month] = monthlyWeekdayData[month] / monthlyWeekdayCount[month];
    return acc;
  }, {});

  const averageMonthlyWeekendData = Object.keys(monthlyWeekendData).reduce((acc, month) => {
    acc[month] = monthlyWeekendData[month] / monthlyWeekendCount[month];
    return acc;
  }, {});

  const averageYearlyWeekdayData = Object.keys(yearlyWeekdayData).reduce((acc, year) => {
    acc[year] = yearlyWeekdayData[year] / yearlyWeekdayCount[year];
    return acc;
  }, {});

  const averageYearlyWeekendData = Object.keys(yearlyWeekendData).reduce((acc, year) => {
    acc[year] = yearlyWeekendData[year] / yearlyWeekendCount[year];
    return acc;
  }, {});

  // Datos para el gráfico
  const chartData = {
    labels: Object.keys(averageMonthlyWeekdayData),
    datasets: [
      {
        label: 'Promedio Asistencias Semanales',
        data: Object.values(averageMonthlyWeekdayData),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
      {
        label: 'Promedio Asistencias Fin de Semana',
        data: Object.values(averageMonthlyWeekendData),
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1
      },
      {
        label: 'Promedio Anual Asistencias Semanales',
        data: Object.values(averageYearlyWeekdayData),
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1,
        borderDash: [5, 5]
      },
      {
        label: 'Promedio Anual Asistencias Fin de Semana',
        data: Object.values(averageYearlyWeekendData),
        fill: false,
        borderColor: 'rgba(153, 102, 255, 1)',
        tension: 0.1,
        borderDash: [5, 5]
      }
    ]
  };

  return (
    <div className='container my-4'>
      <h3 className="text-center">Estadísticas</h3>
      <div style={{ width: '80%', maxWidth: '600px', margin: '0 auto' }}>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default Estadisticas;





