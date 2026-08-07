import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="bg-background @container py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div>
          <h2 className="text-balance font-serif text-4xl font-medium">
            Built for Trust, Speed, and Local Relevance
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            Say goodbye to unverified workers and middleman commissions. LabourIn connects you directly with available professionals in your area.
          </p>
        </div>
        <div className="@xl:grid-cols-2 mt-12 grid gap-3 *:p-6">
          <Card className="row-span-2 grid grid-rows-subgrid">
            <div className="space-y-2">
              <h3 className="text-foreground font-medium">
                CNIC-Verified Professionals
              </h3>
              <p className="text-muted-foreground text-sm">
                Every service provider submits mandatory CNIC credentials reviewed by our team before going live.
              </p>
            </div>
            <div
              aria-hidden
              className="**:fill-foreground flex h-44 flex-col justify-between pt-8"
            >
              <div className="relative flex h-10 items-center gap-12 px-6">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  CNIC Verified
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  Identity Shield
                </div>
              </div>
              <div className="pl-17 relative flex h-10 items-center justify-between gap-12 pr-6">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  Lahore
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  Karachi
                </div>
              </div>
              <div className="relative flex h-10 items-center gap-20 px-8">
                <div className="bg-border absolute inset-0 my-auto h-px"></div>

                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  Islamabad
                </div>
                <div className="bg-card shadow-black/6.5 ring-border relative flex h-8 items-center rounded-full px-3 text-xs font-medium shadow-sm ring">
                  Admin Safe
                </div>
              </div>
            </div>
          </Card>
          <Card className="row-span-2 grid grid-rows-subgrid overflow-hidden">
            <div className="space-y-2">
              <h3 className="text-foreground font-medium">Available Now Matching</h3>
              <p className="text-muted-foreground text-sm">
                Filter workers by real-time online status to find experts ready to arrive in 1–2 hours.
              </p>
            </div>
            <div aria-hidden className="relative h-44 translate-y-6">
              <div className="bg-foreground/15 absolute inset-0 mx-auto w-px"></div>
              <div className="absolute -inset-x-16 top-6 aspect-square rounded-full border"></div>
              <div className="border-primary mask-l-from-50% mask-l-to-90% mask-r-from-50% mask-r-to-50% absolute -inset-x-16 top-6 aspect-square rounded-full border"></div>
              <div className="absolute -inset-x-8 top-24 aspect-square rounded-full border"></div>
              <div className="mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50% absolute -inset-x-8 top-24 aspect-square rounded-full border border-lime-500"></div>
            </div>
          </Card>
          <Card className="row-span-2 grid grid-rows-subgrid overflow-hidden">
            <div className="space-y-2">
              <h3 className="text-foreground font-medium">Neighborhood & Landmark Search</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Search by specific area and local landmarks so workers find your location without hassle.
              </p>
            </div>
            <div
              aria-hidden
              className="*:bg-foreground/15 flex h-44 justify-between pb-6 pt-12 *:h-full *:w-px"
            >
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div className="bg-primary!"></div>
            </div>
          </Card>
          <Card className="row-span-2 grid grid-rows-subgrid">
            <div className="space-y-2">
              <h3 className="font-medium">Direct Call & WhatsApp Access</h3>
              <p className="text-muted-foreground text-sm">
                Once a job is accepted, contact your provider directly via phone or WhatsApp with zero middleman fees.
              </p>
            </div>

            <div className="pointer-events-none relative -ml-7 flex size-44 items-center justify-center pt-5">
              <Shield className="absolute inset-0 top-2.5 size-full stroke-[0.1px] opacity-15" />
              <Shield className="size-32 stroke-[0.1px]" />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
