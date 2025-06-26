export interface JwtPayload {
  scope: string
  exp: number
  [key: string]: any
}

export interface Person {
  id: string
  email: string
  name: string
  surname: string
  fullName: string
}

export interface Course {
  id: number
  name: string
  coordinator: Person
}

export interface Discipline {
  id: number
  name: string
  abbreviation: string
  course: Course
  teacher: Person
}

export interface ClassRoom {
  id: number
  name: string
  abbreviation: string
  location: string
}

export interface Semester {
  id: number
  name: string
  year: number
  semester: number
  startDate: string
  endDate: string
  status: string
}

export interface Group {
  id: number
  name: string
  abbreviation: string
  discipline: Discipline
  classRoom: ClassRoom
  semester: Semester
  color: string
}

export interface IScheduleItem {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  group: {
    id: number;
    name: string;
    abbreviation: string;
    color: string;
    semesterOfCourse: number;
    discipline: {
      id: number;
      name: string;
      abbreviation: string;
      teacher: {
        fullName: string;
      };
      course: {
        name: string;
        abbreviation: string;
      }
    };
    classRoom: {
      id: number;
      abbreviation: string;
    };
  };
  semester: {
    id: number;
  };
}

export interface DefaultFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  initialData?: any;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalPages: number;
    totalElements: number;
  }
}
