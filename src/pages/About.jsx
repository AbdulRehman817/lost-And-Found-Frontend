import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { ReuniteLogo } from "../components/icons";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <div className="space-y-12">
            <Card className="overflow-hidden shadow-sm border-border/50 rounded-2xl">
              <CardHeader className="bg-card p-6 border-b">
                <div className="flex items-center gap-4">
                  <ReuniteLogo className="h-12 w-12 text-primary" />
                  <div>
                    <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl font-headline">
                      About Reunite
                    </h1>
                    <p className="text-muted-foreground">
                      Connecting communities, one found item at a time.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-lg leading-relaxed text-foreground/80 space-y-4">
                <p>
                  Reunite was born from a simple idea: losing something valuable
                  is stressful, but finding it doesn't have to be. We believe in
                  the power of community and technology to create positive
                  outcomes.
                </p>
                <p>
                  Our platform provides a centralized, secure, and user-friendly
                  space for people to report lost items and for good samaritans
                  to post things they've found. By bridging the gap between the
                  one who lost and the one who found, we aim to foster a
                  community of trust and helpfulness, making our neighborhoods a
                  little more connected and a lot less stressful.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-sm border-border/50 rounded-2xl">
              <div className="relative h-40 w-full bg-muted">
                <img
                  src="public/banner.jpg"
                  alt="Developer Banner"
                  fill
                  className="object-cover"
                  data-ai-hint="abstract background"
                />
              </div>
              <div className="p-6 pt-0">
                <div className="flex justify-between items-end -mt-16">
                  <Avatar className="h-32 w-32 border-4 rounded-full border-background shadow-md">
                    <img
                      src="public/pic.png"
                      alt="Abdul Rehman"
                      className="h-[280px] relative top-[-68px] w-[120px]"
                    />
                  </Avatar>

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        to="https://www.linkedin.com/in/abdulrehman1718"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        to="https://github.com/AbdulRehman817"
                        aria-label="GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        to="mailto:abdulrehmanbey1718@gmail.com"
                        aria-label="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold font-headline">
                      Abdul Rehman
                    </h2>
                    <p className="text-muted-foreground">
                      Full-Stack Developer & Creator of Reunite
                    </p>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    A passionate developer with a love for creating modern,
                    user-friendly web applications. This project was built to
                    explore cutting-edge technologies and solve real-world
                    problems. To learn more about my work or explore other
                    projects, I invite you to visit my portfolio.
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-sm hover:shadow-md transition-all"
                    asChild
                  >
                    <Link to="https://abdulrehmanweb.vercel.app/">
                      View Portfolio <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
