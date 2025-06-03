import {
  ChartBarIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface FeatureItemProps {
  Icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

function FeatureItem({
  title,
  description,
  className,
  Icon,
}: FeatureItemProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          {Icon}
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
        <p className="text-sm font-medium opacity-70">{description}</p>
      </div>
    </div>
  );
}

export function SecondFeaturesSection() {
  return (
    <div className="flex flex-col gap-4 items-start justify-center w-full mx-auto max-w-5xl my-24">
      <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-4 border-y">
        <div className="flex flex-col gap-2 md:border-r md:pr-4 my-24">
          <h2 className="text-xl font-medium">Chat with living knowledge</h2>
          <p className="text-[16px] opacity-70 font-medium">
            Link documents to a chat once, never paste knowledge again.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:pl-4 my-24">
          <h2 className="text-xl font-medium">
            Docs write themselves as you chat
          </h2>
          <p className="text-[16px] opacity-70 font-medium">
            Every chat can be converted into a new document, merged between two
            or update one.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-4 grid-rows-1 gap-4 w-full mt-12">
        <FeatureItem
          Icon={<SparklesIcon className="w-[18px] h-[18px]" />}
          title="Instant AI answser"
          description="Natural-language search that cites the exact doc line, so teammates find truth in one go."
          className="col-span-2 row-span-1"
        />
        <FeatureItem
          Icon={<DocumentDuplicateIcon className="w-[18px] h-[18px]" />}
          title="Branch-&-Version Docs"
          description="Fork ideas like code; compare and roll back any edit without losing the original thread."
          className="col-span-2 row-span-1"
        />
        <FeatureItem
          Icon={<LinkIcon className="w-[18px] h-[18px]" />}
          title="Context-Aware Chat Links"
          description="Pin one or many docs to a chat, Vooster remembers content forever, no copy-paste dumps."
          className="col-span-2 row-span-1"
        />
        <FeatureItem
          Icon={<ChartBarIcon className="w-[18px] h-[18px]" />}
          title="Live Knowledge Insights"
          description="See top queries, most-viewed docs, and coverage gaps in a single glance to keep info fresh."
          className="col-span-2 row-span-1"
        />
      </div>
    </div>
  );
}
