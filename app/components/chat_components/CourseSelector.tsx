interface Course {
    id: string;
    name: string;
    code: string;
  }
  
  interface CourseSelectorProps {
    courses: Course[];
    onSelectCourse: (courseId: string) => void;
    isLoading: boolean;
  }
  
  export default function CourseSelector({ courses, onSelectCourse, isLoading }: CourseSelectorProps) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Select Your Course
          </h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">
              {isLoading ? "Loading courses..." : "No courses available."}
            </p>
          ) : (
            <ul className="space-y-2">
              {courses.map((course) => (
                <li
                  key={course.id}
                  className="p-2 border rounded-md cursor-pointer hover:bg-gray-100"
                  onClick={() => onSelectCourse(course.id)}
                >
                  {course.code} - {course.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }