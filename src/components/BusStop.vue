<template>
  <div>
    <h2>Valitse pysäkkinumero:</h2>
  </div>
  <div>
    <select v-model="selectedOption" @change="slicer(1)">
      <option v-for="(stop, index) in stops" :key="index" :value="stop.stop_code">
        {{ stop.stop_code + ' ' + stop.stop_name }}
      </option>
    </select>
  </div>
  <div>
    <h3>Valitun pysäkin numero: {{ selectedOption }}</h3>
    <h3>Lähtöajat seuraaville vuoroille:</h3>
    <!-- Tällä hetkellä näyttää 20 aikaa, niiden trip_id:t ja kohteen -->
    <div>
      <table>
        <thead>
          <tr>
            <th>Aika</th>
            <th>Linja/trip_id</th>
            <th>Kohde</th>
          </tr>
        </thead>
      </table>
    </div>
    <div class="table-wrapper">
      <table v-for="(item, index) in currentPageItems" :key="index">
        <tbody>
          <tr>
            <td>{{ item.arrival_time }}</td>
            <td>{{ item.trip_id }}</td>
            <td>{{ item.tripData[0].trip_headsign }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div>
    <nav>
      <ul>
        <button v-if="currentPage > 1" @click="prevPage">Previous</button>
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
        <button v-if="currentPage < totalPages" @click="nextPage">Next</button>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ApiService, { type RouteData } from '../ApiService'
import type { StopTime, Stop, TripData } from '../ApiService'

const stops = ref<any>([])
const selectedOption = ref<number>(0)
const stopsInCO = ref<any>([])

const itemsPerPage = 10
const currentPage = ref(1)

const headsign = ref<any>([])

const totalPages = computed(() => Math.ceil(stopsInCO.value.length / itemsPerPage))

const currentPageItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  console.log(stopsInCO.value.slice(startIndex, startIndex + itemsPerPage))
  return stopsInCO.value.slice(startIndex, startIndex + itemsPerPage)
})

const nextPage = () => {
  currentPage.value++
}

const prevPage = () => {
  currentPage.value--
}

const goToPage = (pageNumber: number) => {
  currentPage.value = pageNumber
}

const fetchStopTimes = async (): Promise<StopTime[]> => {
  try {
    const result = await ApiService.getStopTimes(selectedOption.value)
    stopsInCO.value = result
    return result
  } catch (error) {
    console.error(error)
    return []
  }
}

const slicer = async (currentPage: number) => {
  const stopT = await fetchStopTimes()
  const itemsInPage = 20
  const slicedArray20 = stopT.slice(
    currentPage * itemsInPage,
    currentPage * itemsInPage + itemsInPage
  )
  const mappi = slicedArray20.map(async (stopTime) => {
    const tripData = await fetchTripData(stopTime.trip_id)
    const result = { ...stopTime, tripData }
    return result
  })
  const resolvedArray = await Promise.all(mappi)
  stopsInCO.value = resolvedArray
  return resolvedArray
}

const fetchTripData = async (trip_id: string): Promise<TripData[]> => {
  try {
    const result = await ApiService.getTripData(trip_id)
    result.map((a) => {
      console.log(a.trip_headsign)
      headsign.value = headsign.value.concat(a.trip_headsign)
      return a.trip_headsign
    })
    console.log('result: ', result)
    return result
  } catch (error) {
    console.error(error)
    return []
  }
}

const fetchStops = async (): Promise<Stop[]> => {
  try {
    const result = await ApiService.getStops()
    stops.value = result
    return result
  } catch (error) {
    console.error(error)
    return []
  }
}

const fetchRouteData = async (route_id: string): Promise<RouteData[]> => {
  try {
    const result = await ApiService.getRouteData(route_id)
    return result
  } catch (error) {
    console.error(error)
    return []
  }
}

onMounted(() => {
  fetchStops()
})
</script>

<style>
.table-wrapper {
  height: 300px;
  overflow-y: auto;
  overflow-x: auto;
}
table {
  border-collapse: collapse;
  width: 100%;
}
thead {
  top: 0;
}

th,
td {
  border: hidden;
  padding: 8px;
  text-align: left;
}

th {
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
thead {
  position: sticky;
  top: 0;
}
</style>
