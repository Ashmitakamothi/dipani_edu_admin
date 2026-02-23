import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import React from "react";
import { lazy, Suspense, useState } from "react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AddFilter from "./components/filters/AddFilter";
import FilterList from "./components/filters/FilterList";
import AddCourse from "./pages/courses/AddCourse";
import CourseList from "./pages/courses/CourseList";
import { Edit } from "lucide-react";
import EditCourse from "./pages/courses/EditCourse";
import AddBundle from "./pages/bundles/AddBundle";
import BundleList from "./pages/bundles/bundleList";
import EditBundleForm from "./pages/bundles/EditBundle";
import QuizList from "./pages/Quiz/QuizList";
import AssignmentList from "./pages/Assignmets/AssignmentList";
import TextLessonPage from "./pages/courses/TextLesson";
import EditQuiz from "./pages/courses/components/EditQuiz";
import EditAssignmentForm from "./pages/courses/components/EditAssignment";
import EditTextLessonEditor from "./pages/courses/components/EditTextLesson";
import FileList from "./pages/Files/FileList";
import AddFile from "./pages/courses/components/AddFile";
import Session from "./pages/Files/Session";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authslice";
import StudentList from "./pages/students/StudentList";
import StudentDetail from "./pages/students/StudentDetail";
import AssignmentSubmissionReview from "./pages/Assignmets/AssignmentDetails";
import AssignmentPage from "./pages/Assignmets/AssignmentPage";
import HelpDesk from "./pages/HelpDesk/RequestList";
import TicketDetails from "./pages/HelpDesk/TicketDetails";
import CertificationList from "./pages/Certification/CertificationList";
import EditCreateCertificateTemplate from "./pages/Certification/EditeCertification";
import IssueCertification from "./pages/Certification/IssueCertification";
import DeleteRequestsList from "./pages/students/DeleteRequestsList";
import User from "./pages/SalesAnalytics/User";
import Course from "./pages/SalesAnalytics/Course";
import Bundel from "./pages/SalesAnalytics/Bundel";
import Project from "./pages/Files/Project";
import QueryList from "./pages/Query/QueryList";
import Coupons from "./pages/coupons/Coupons";
import CreateCoupon from "./pages/coupons/CreateCoupon";
import EditCoupon from "./pages/coupons/EditCoupon";
import ForumThreadList from "./pages/Forum/ForumThreadList";
import AppNotificationSender from "./pages/AppNotificationSender";
import DeviceApprovals from "./pages/DeviceApprovals";
import ForumDetails from "./pages/Forum/ForumDetails";
import EditForumThread from "./pages/Forum/EditForumThread";
import AddEvent from "./pages/Events/AddEvent";
import EventList from "./pages/Events/EventList";
import EditEvent from "./pages/Events/EditEvent";
import AddJob from "./pages/Jobs/AddJob";
import JobList from "./pages/Jobs/JobList";
import EditJob from "./pages/Jobs/EditJob";
import TestimonialsPage from "./pages/Testimonials";
import Banner from "./pages/Banner/banner";
import AllBanners from "./pages/Banner/AllBanners";
import AddBanner from "./pages/Banner/AddBanner";
import EditBanner from "./pages/Banner/EditBanner";
import LeaderboardSetting from "./pages/LeaderboardSetting";
import GeneralSetting from "./pages/GeneralSetting";
import NotificationDashboard from "./pages/Notifications/NotificationDashboard";
import NotificationList from "./pages/Notifications/NotificationList";
import NewsList from "./pages/News/NewsList";
import AddNews from "./pages/News/AddNews";
import EditNews from "./pages/News/EditNews";
import ViewNews from "./pages/News/ViewNews";
import ManageQuestions from "./pages/PersonalityTest/ManageQuestions";
import AITool from "./pages/AITool/AITool";
import EbookList from "./pages/ebooks/EbookList";
import AddEbook from "./pages/ebooks/AddEbook";
import EditEbook from "./pages/ebooks/EditEbook";

// Lazy load pages
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));

const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const BasicTables = lazy(() => import("./pages/Tables/BasicTables"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const AddCategory = lazy(() => import("./pages/AddCategory"));
const CategoryList = lazy(() => import("./pages/CategoryList"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const Home = lazy(() => import("./pages/Dashboard/Home"));
const AddReporter = lazy(() => import("./pages/Reporters/AddReporter"));
const AddPartner = lazy(() => import("./pages/Reporters/AddPartner"));
const PartnerList = lazy(() => import("./pages/Reporters/PartnerList"));
const EditPartner = lazy(() => import("./pages/Reporters/EditPartner"));
const CreateCertificateTemplate = lazy(
  () => import("./pages/Certification/CreateCertificateTemplate")
);

// Simple modal wrapper for SignIn
function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          minWidth: 350,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SignIn />
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showSignIn, setShowSignIn] = useState(false);

  // Show popup if not authenticated and not on /signin or /signup
  // (You may want to refine this logic based on your routing needs)
  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowSignIn(true);
    } else {
      setShowSignIn(false);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
        <Routes>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Route
            path="/signin"
            element={
              !isAuthenticated ? <SignIn /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignUp /> : <Navigate to="/" replace />
            }
          />

          {/* Protected Routes - Only accessible when authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/add-category" element={<AddCategory />} />
              <Route path="/categories" element={<CategoryList />} />

              {/* Filters */}
              <Route path="/filters/add" element={<AddFilter />} />
              <Route path="/filters/all" element={<FilterList />} />

              <Route path="/event/add" element={<AddEvent />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/edit/:id" element={<EditEvent />} />

              {/* Jobs */}
              <Route path="/jobs/add" element={<AddJob />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/edit/:id" element={<EditJob />} />
              {/* Courses */}
              <Route path="/courses/add" element={<AddCourse />} />
              <Route path="/courses/all/courses" element={<CourseList />} />
              <Route path="/courses/edit/:courseId" element={<EditCourse />} />
              <Route
                path="/courses/all/text-courses"
                element={<TextLessonPage />}
              />
              <Route
                path="/courses/text-courses/:lessonId"
                element={<EditTextLessonEditor />}
              />


              <Route path="/reporters/add" element={<AddReporter />} />
              <Route path="/partners/add" element={<AddPartner />} />
              <Route path="/partners/list" element={<PartnerList />} />
              <Route path="/partners/edit/:id" element={<EditPartner />} />

              {/* Bundles */}
              <Route path="/bundles/create" element={<AddBundle />} />
              <Route path="/bundles/all" element={<BundleList />} />
              <Route path="/bundles/:bundleId" element={<EditBundleForm />} />

              {/* Quiz */}
              <Route path="/quiz/all" element={<QuizList />} />
              <Route path="/quiz/edit/:quizId" element={<EditQuiz />} />

              {/* Assignments */}
              <Route path="/assignments/all" element={<AssignmentList />} />
              <Route path="/assignments/:assignmentId" element={<AssignmentPage />} />
              <Route
                path="/assignments/edit/:assignmentId"
                element={<EditAssignmentForm />}
              />
              <Route
                path="/assignments/submissions"
                element={<AssignmentList />}
              />
              <Route
                path="/assignments/submissions/:id"
                element={<AssignmentSubmissionReview />}
              />

              <Route path="/forum" element={<ForumThreadList />} />
              <Route path="/forum/create" element={<EditForumThread />} />
              <Route path="/forum/:threadId" element={<ForumDetails />} />
              <Route path="/forum/edit/:threadId" element={<EditForumThread />} />

              {/* Support Tickets */}
              <Route
                path="/support-tickets/view/:ticketId"
                element={<TicketDetails isEditMode={false} />}
              />
              <Route
                path="/support-tickets/edit/:ticketId"
                element={<TicketDetails isEditMode={true} />}
              />
              <Route path="/requests" element={<HelpDesk />} />

              {/* Certificates */}
              <Route
                path="/certificates-template/add"
                element={<CreateCertificateTemplate />}
              />
              <Route
                path="/certificates-template/all"
                element={<CertificationList />}
              />
              <Route
                path="/certificates-template/edit/:certificateId"
                element={<EditCreateCertificateTemplate />}
              />
              <Route
                path="/certificates/issue"
                element={<IssueCertification />}

              />

              {/* Coupons */}
              <Route path="/coupons" element={<Navigate to="/coupons/all" replace />} />
              <Route path="/coupons/all" element={<Coupons />} />
              <Route path="/coupons/add" element={<CreateCoupon />} />
              <Route path="/coupons/edit/:couponId" element={<EditCoupon />} />

              {/* Ebooks */}
              <Route path="/ebooks/all" element={<EbookList />} />
              <Route path="/ebooks/add" element={<AddEbook />} />
              <Route path="/ebooks/edit/:id" element={<EditEbook />} />

              {/* Files */}
              <Route path="/files/all" element={<FileList />} />
              <Route path="/files/add" element={<AddFile />} />
              <Route path="/files/sessions" element={<Session />} />
              <Route path="/files/projects" element={<Project />} />

              {/* Students */}
              <Route path="/students/all" element={<StudentList />} />
              <Route path="/students/:studentId" element={<StudentDetail />} />
              <Route path="/students/delete-requests" element={<DeleteRequestsList />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />


              <Route path="/banner" element={<AllBanners />} />
              <Route path="/banner/add" element={<AddBanner />} />
              <Route path="/banner/edit/:id" element={<EditBanner />} />

              {/* News */}
              <Route path="/news" element={<NewsList />} />
              <Route path="/news/add" element={<AddNews />} />
              <Route path="/news/view/:id" element={<ViewNews />} />
              <Route path="/news/edit/:id" element={<EditNews />} />

              {/* sales analytics */}
              <Route path="/sales/user" element={<User />} />
              <Route path="/sales/course" element={<Course />} />
              <Route path="/sales/bundle" element={<Bundel />} />

              {/* query */}
              <Route path="/queries/all" element={<QueryList />} />


              {/* User Profiles */}

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />


              {/* UI Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/send-notification" element={<NotificationDashboard />} />
              <Route path="/notification-history" element={<NotificationList />} />
              <Route path="/device-approvals" element={<DeviceApprovals />} />
              {/* Testimonials */}
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/ai-tool" element={<AITool />} />
              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
              <Route path="/leaderboard-setting" element={<LeaderboardSetting />} />
              <Route path="/general-setting" element={<GeneralSetting />} />
              <Route path="/personality-test" element={<ManageQuestions />} />
            </Route>
          </Route>

          {/* Redirect unauthenticated users to signup instead of signin */}
          <Route
            path="*"
            element={
              !isAuthenticated ? (
                <Navigate to="/signup" replace />
              ) : (
                <NotFound />
              )
            }
          />
        </Routes>
        {/* SignIn Popup */}
        <SignInModal open={showSignIn && window.location.pathname !== "/signin" && window.location.pathname !== "/signup"} onClose={() => setShowSignIn(false)} />
      </Suspense>
    </Router>
  );
}
