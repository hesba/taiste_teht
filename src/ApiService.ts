import axios from 'axios'

export interface Stop {
  location_type: number
  parent_station: number
  stop_code: string
  stop_desc: string
  stop_lat: number
  stop_lon: number
  stop_name: string
  stop_timezone: string
  stop_url: string
  wheelchair_boarding: number
  zone_id: string
}

export interface StopTime {
  arrival_time: string
  departure_time: string
  drop_off_type: number
  pickup_type: number
  shape_dist_traveled: number
  stop_headsign: string
  stop_sequence: number
  timepoint: number
  trip_id: string
}

export interface TripData {
  bikes_allowed: number
  block_id: string
  direction_id: number
  route_id: string
  service_id: string
  shape_id: string
  trip_headsign: string
  wheelchair_accessible: number
}

export interface RouteData {
  route_id: string
  agency_id: string
  route_short_name: string
  route_long_name: string
  route_desc: string
  route_type: number
  route_url: string
  route_color: string
  route_text_color: string
}

class ApiService {
  private apiUrl_gtfs = 'https://data.foli.fi/gtfs/'

  async getStops(): Promise<Stop[]> {
    try {
      const { data } = await axios.get<Stop[]>(this.apiUrl_gtfs + 'stops')
      return data
    } catch (error) {
      console.error(error)
      throw new Error('Failed to fetch stops from API')
    }
  }

  async getStopTimes(stopId: number): Promise<StopTime[]> {
    try {
      const { data } = await axios.get<StopTime[]>(this.apiUrl_gtfs + 'stop_times/stop/' + stopId)
      return data
    } catch (error) {
      console.error(error)
      throw new Error('Failed to fetch stoptimes from API')
    }
  }

  async getTripData(trip_id: string): Promise<TripData[]> {
    try {
      const { data } = await axios.get<TripData[]>(this.apiUrl_gtfs + 'trips/trip/' + trip_id)
      return data
    } catch (error) {
      console.error(error)
      throw new Error('Failed to fetch tripdata from API')
    }
  }

  async getRouteData(route_id: string): Promise<RouteData[]> {
    try {
      const { data } = await axios.get<RouteData[]>(this.apiUrl_gtfs + 'routes/' + route_id)
      return data
    } catch (error) {
      console.error(error)
      throw new Error('Failed to fetch routedata from API')
    }
  }
}

export default new ApiService()
