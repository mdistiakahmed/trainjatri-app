import { getDataForTrain } from './getData';
import { uniqueTrainNames } from './trainNames';

interface TrainSchedule {
  train_name: string;
  train_number: number;
  departure_from_source: string;
  arrival_at_destination: string;
  journey_duration: string;
  days: string[];
}

export async function getTrainsForRoute(fromStation: string, toStation: string): Promise<TrainSchedule[]> {
  const trains: TrainSchedule[] = [];

  for (const trainName of uniqueTrainNames) {
    try {
      const fileName = trainName.toLowerCase().replace(/\s+/g, '_');
      const trainData = await getDataForTrain(fileName);

      // Check forward route
      if (trainData.forward?.routes) {
        const routes = trainData.forward.routes;
        const fromIndex = routes.findIndex((r: any) => 
          r.city.replace(/_/g, ' ').toLowerCase() === fromStation.toLowerCase()
        );
        const toIndex = routes.findIndex((r: any) => 
          r.city.replace(/_/g, ' ').toLowerCase() === toStation.toLowerCase()
        );

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          trains.push({
            train_name: trainData.forward.train_name,
            train_number: trainData.forward.train_number,
            departure_from_source: routes[fromIndex].departure_time || '',
            arrival_at_destination: routes[toIndex].arrival_time || '',
            journey_duration: trainData.forward.total_duration,
            days: trainData.forward.days,
          });
        }
      }

      // Check reverse route
      if (trainData.reverse?.routes) {
        const routes = trainData.reverse.routes;
        const fromIndex = routes.findIndex((r: any) => 
          r.city.replace(/_/g, ' ').toLowerCase() === fromStation.toLowerCase()
        );
        const toIndex = routes.findIndex((r: any) => 
          r.city.replace(/_/g, ' ').toLowerCase() === toStation.toLowerCase()
        );

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          trains.push({
            train_name: trainData.reverse.train_name,
            train_number: trainData.reverse.train_number,
            departure_from_source: routes[fromIndex].departure_time || '',
            arrival_at_destination: routes[toIndex].arrival_time || '',
            journey_duration: trainData.reverse.total_duration,
            days: trainData.reverse.days,
          });
        }
      }
    } catch (error) {
      continue;
    }
  }

  // Sort by departure time
  return trains.sort((a, b) => {
    const timeA = a.departure_from_source.replace(' BST', '').replace(/:/g, '');
    const timeB = b.departure_from_source.replace(' BST', '').replace(/:/g, '');
    return timeA.localeCompare(timeB);
  });
}
