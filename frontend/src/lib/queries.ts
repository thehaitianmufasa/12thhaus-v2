import { gql } from '@apollo/client';

// Query to get all spiritual disciplines with pricing
export const GET_SPIRITUAL_DISCIPLINES = gql`
  query GetSpiritualDisciplines {
    spiritual_disciplines {
      id
      name
      category
      description
      typical_duration_minutes
      typical_price_range_min
      typical_price_range_max
      created_at
    }
  }
`;

// Query to get practitioners for a specific discipline
export const GET_PRACTITIONERS_BY_DISCIPLINE = gql`
  query GetPractitionersByDiscipline($disciplineId: ID!) {
    practitioners(disciplineId: $disciplineId) {
      id
      user_id
      display_name
      bio
      years_experience
      hourly_rate
      rating_average
      total_sessions
      is_verified
      created_at
    }
  }
`;

// Query to get all available practitioners
export const GET_ALL_PRACTITIONERS = gql`
  query GetAllPractitioners {
    practitioners {
      id
      user_id
      display_name
      bio
      years_experience
      hourly_rate
      rating_average
      total_sessions
      is_verified
      created_at
    }
  }
`;

// Query to get service offerings for a practitioner
export const GET_SERVICE_OFFERINGS = gql`
  query GetServiceOfferings($practitionerId: ID!) {
    service_offerings(practitionerId: $practitionerId) {
      id
      practitioner_id
      spiritual_discipline_id
      title
      description
      duration_minutes
      price
      is_active
      created_at
    }
  }
`;