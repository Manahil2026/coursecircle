export const fetchCourses = async (role: string | undefined) => {
  try {
    const endpoint = role === "prof" ? "/api/courses/professor" : "/api/courses/student";
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Failed to fetch courses");
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    return null;
  }
};

export const fetchModules = async (
  courseId: string,
  setModules: (modules: any[]) => void,
  setCourseId: (id: string | null) => void,
  setFetchingModules: (isFetching: boolean) => void
) => {
  setFetchingModules(true);
  try {
    const response = await fetch(`/api/modules?courseId=${courseId}`);
    if (!response.ok) throw new Error(`Error fetching modules: ${response.statusText}`);
    const data = await response.json();
    setModules(data);
    setCourseId(courseId);
    return data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    return null;
  } finally {
    setFetchingModules(false);
  }
};
