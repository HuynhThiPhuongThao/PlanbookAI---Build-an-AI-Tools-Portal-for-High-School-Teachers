import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuestionBank from "./pages/QuestionBank";
import ExerciseCreator from "./pages/ExerciseCreator";
import ExamGenerator from "./pages/ExamGenerator";
import OCRGrading from "./pages/OCRGrading";
import LessonPlanner from "./pages/LessonPlanner";
import StudentResults from "./pages/StudentResults";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "teacher", Component: TeacherDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "manager", Component: ManagerDashboard },
      { path: "staff", Component: StaffDashboard },
      { path: "question-bank", Component: QuestionBank },
      { path: "exercise-creator", Component: ExerciseCreator },
      { path: "exam-generator", Component: ExamGenerator },
      { path: "ocr-grading", Component: OCRGrading },
      { path: "lesson-planner", Component: LessonPlanner },
      { path: "student-results", Component: StudentResults },
      { path: "*", Component: NotFound },
    ],
  },
]);
