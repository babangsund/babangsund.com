import { Card } from "../components/Card";
import styles from "@/styles/Home.module.scss";

const cards = [
  {
    href: "/blog",
    title: "Blog",
    description: "My personal tech blog",
  },
  {
    href: "https://www.anduril.com/mission-autonomy/",
    title: "Lattice Space, Autonomy & Web Platform",
    description: "Anduril",
    backgroundImg: "/projects/anduril_lattice.jpeg",
    backgroundImgPriority: true,
  },
  {
    href: "https://notspacexlaunches.com/",
    title: "Interactive SpaceX launch playback",
    description: "Personal project",
    backgroundImg: "/projects/notspacexlaunches.com.png",
    backgroundImgPriority: true,
  },
  {
    href: "https://www.aboutamazon.com/news/transportation/amazon-prime-air-prepares-for-drone-deliveries",
    backgroundImg: "/projects/prime_air_drone.webp",
    title: "Commercial & flight test ground control",
    description: "Amazon Prime Air",
    backgroundImgPriority: true,
  },
  {
    href: "https://aws.amazon.com/devops-guru/features/devops-guru-for-rds/",
    backgroundImg: "/projects/dog_rds.png",
    title: "Amazon DevOps Guru & RDS integration",
    description: "Amazon DevOps Guru | Amazon RDS",
    backgroundImgPriority: true,
  },
  {
    href: "https://aws.amazon.com/blogs/devops/generate-devops-guru-proactive-insights-in-ecs-using-container-insights/",
    backgroundImg: "/projects/dog_proactive.png",
    title: "Proactive insight analysis",
    description: "Amazon DevOps Guru",
  },
  {
    href: "https://aws.amazon.com/blogs/devops/automate-container-anomaly-monitoring-of-amazon-elastic-kubernetes-service-clusters-with-amazon-devops-guru/",
    backgroundImg: "/projects/dog_eks.png",
    title: "Amazon EKS & ECS container anomaly monitoring",
    description: "Amazon DevOps Guru | Amazon EKS | Amazon ECS",
  },
  {
    href: "https://aws.amazon.com/devops-guru/",
    backgroundImg: "/projects/dog.png",
    title: "Launch Amazon DevOps Guru",
    description: "Amazon DevOps Guru",
  },
  {
    href: "https://aws.amazon.com/bugbust/",
    backgroundImg: "/projects/bugbust.jpeg",
    title: "Launch Amazon CodeGuru BugBust",
    description: "Amazon CodeGuru BugBust",
  },
  {
    href: "https://aws.amazon.com/codeguru#Amazon_CodeGuru_Reviewer",
    backgroundImg: "/projects/reviewer.png",
    title: "Launch Amazon CodeGuru Reviewer",
    description: "Amazon CodeGuru Reviewer",
  },
  {
    href: "https://docs.aws.amazon.com/codeguru/latest/profiler-ug/working-with-visualizations-heap-summary.html",
    backgroundImg: "/projects/profiler_heap.png",
    title: "Heap summary graphs",
    description: "Amazon CodeGuru Profiler",
  },
  {
    href: "https://aws.amazon.com/codeguru#Amazon_CodeGuru_Profiler",
    backgroundImg: "/projects/profiler.png",
    title: "Launch Amazon CodeGuru Profiler",
    description: "Amazon CodeGuru Profiler",
  },
  {
    href: "https://mindworking.eu/produkter/",
    backgroundImg: "/projects/mindworking.png",
    title: "Real estate web application",
    description: "Mindworking.dk",
  },
];

export default function Home() {
  return (
    <ul className={styles.ul}>
      {cards.map((card) => (
        <Card
          key={card.href}
          href={card.href}
          backgroundImg={card.backgroundImg}
          backgroundImgPriority={card.backgroundImgPriority}
        >
          <h4>{card.title}</h4>
          <small>{card.description}</small>
        </Card>
      ))}
    </ul>
  );
}
