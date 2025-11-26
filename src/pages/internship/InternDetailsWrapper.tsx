import { useParams, useNavigate } from "react-router-dom";
import InternDetails from "./InternDetails";

export default function InternDetailsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    navigate("/internship/candidate");
    return null;
  }

  return <InternDetails candidateId={id} onBack={() => navigate("/internship/candidate")} />;
}
